import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
import {
  DeleteMessagePayload,
  JoinConversationPayload,
  MarkAsReadPayload,
  PresenceOnlinePayload,
  SendMessagePayload,
  TypingPayload,
  UpdateMessagePayload,
} from './chat.types';
import { PresenceService } from './presence.service';

/**
 * Gateway = "controller" của WebSocket.
 *
 * Hai khái niệm quan trọng của Socket.IO được dùng ở đây:
 * - socket: một kết nối của một tab trình duyệt.
 * - room: một cái tên để gom nhiều socket lại, gửi một lần là cả nhóm cùng nhận.
 *
 * Trong file này có 2 loại room:
 * - room theo cuộc trò chuyện (tên = conversationId): những ai đang MỞ đoạn chat đó.
 * - room theo user (tên = "user:<userId>"): tất cả tab của một người, kể cả khi họ
 *   đang xem đoạn chat khác -> dùng để báo có tin nhắn mới ngoài sidebar.
 *
 * Lưu ý (bản rút gọn cho người mới học): server đang tin tưởng `senderId` / `userId`
 * do client gửi lên. Ứng dụng thật nên xác thực JWT ngay khi socket kết nối.
 */
@WebSocketGateway({
  cors: { origin: '*' }, // khi deploy nên ghi rõ domain của frontend
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  /** Server của Socket.IO, dùng để gửi sự kiện cho client. */
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly presenceService: PresenceService,
  ) {}

  // --------------------------------------------------------------------------
  // Kết nối / ngắt kết nối
  // --------------------------------------------------------------------------

  handleConnection(client: Socket) {
    this.logger.log(`Socket kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket ngắt kết nối: ${client.id}`);

    const result = this.presenceService.removeSocket(client.id);
    if (!result) {
      return; // socket này chưa gắn với user nào
    }

    // Báo cho mọi người: user vừa đóng một tab.
    // online = false khi người đó đã đóng hết tab.
    this.server.emit('presence:update', {
      userId: result.userId,
      online: result.isOnline,
    });
  }

  // --------------------------------------------------------------------------
  // Trạng thái online
  // --------------------------------------------------------------------------

  /** Client gửi ngay sau khi đăng nhập: { userId }. */
  @SubscribeMessage('presence:online')
  handlePresenceOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PresenceOnlinePayload,
  ) {
    const userId = payload?.userId;
    if (!userId) {
      return { status: 'error', message: 'Thiếu userId' };
    }

    this.presenceService.addSocket(userId, client.id);
    void client.join(this.getUserRoom(userId));

    // Báo cho tất cả mọi người biết user này vừa online.
    this.server.emit('presence:update', { userId, online: true });

    // Riêng người vừa vào thì gửi luôn danh sách những ai đang online.
    client.emit('presence:list', {
      onlineUserIds: this.presenceService.getOnlineUserIds(),
    });

    return { status: 'ok' };
  }

  // --------------------------------------------------------------------------
  // Tin nhắn
  // --------------------------------------------------------------------------

  /** Vào room của một cuộc trò chuyện khi người dùng mở đoạn chat. */
  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinConversationPayload,
  ) {
    const { conversationId } = payload;
    void client.join(conversationId);

    this.logger.log(`Socket ${client.id} vào phòng ${conversationId}`);

    return { status: 'joined', conversationId };
  }

  /** Gửi tin nhắn mới. */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() payload: SendMessagePayload) {
    try {
      // 1. Lưu tin nhắn vào database.
      const message = await this.messagesService.create(payload.senderId, {
        conversationId: payload.conversationId,
        content: payload.content ?? '',
        type: payload.type,
        imageUrl: payload.imageUrl,
      });

      // 2. Cập nhật "tin nhắn cuối" để danh sách chat sắp xếp lại đúng thứ tự.
      await this.conversationsService.updateLastMessage(
        payload.conversationId,
        message._id.toString(),
      );

      // 3. Gửi cho cả hai người, kể cả người đang xem đoạn chat khác.
      await this.emitToParticipants(
        payload.conversationId,
        'newMessage',
        message,
      );

      return { status: 'sent', message };
    } catch (error) {
      return this.toErrorResponse(error, 'Gửi tin nhắn thất bại');
    }
  }

  /** Sửa nội dung tin nhắn. */
  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(@MessageBody() payload: UpdateMessagePayload) {
    try {
      const message = await this.messagesService.update(
        payload.messageId,
        payload.senderId,
        payload.content,
      );

      // Chỉ người đang mở đoạn chat mới cần biết nội dung vừa đổi.
      this.server.to(payload.conversationId).emit('messageUpdated', message);

      return { status: 'updated', message };
    } catch (error) {
      return this.toErrorResponse(error, 'Sửa tin nhắn thất bại');
    }
  }

  /** Xoá tin nhắn. */
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(@MessageBody() payload: DeleteMessagePayload) {
    try {
      await this.messagesService.remove(payload.messageId, payload.senderId);

      this.server.to(payload.conversationId).emit('messageDeleted', {
        messageId: payload.messageId,
      });

      return { status: 'deleted', messageId: payload.messageId };
    } catch (error) {
      return this.toErrorResponse(error, 'Xoá tin nhắn thất bại');
    }
  }

  /** Báo đang gõ / ngừng gõ. */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    // client.to(...) gửi cho những người KHÁC trong phòng, không gửi lại cho chính mình.
    client.to(payload.conversationId).emit('userTyping', {
      conversationId: payload.conversationId,
      userId: payload.userId,
      isTyping: payload.isTyping,
    });
  }

  /** Đánh dấu đã đọc toàn bộ tin nhắn trong một cuộc trò chuyện. */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(@MessageBody() payload: MarkAsReadPayload) {
    const conversationId = payload?.conversationId;
    const userId = payload?.userId;

    if (!conversationId || !userId) {
      return { status: 'error', message: 'Thiếu conversationId hoặc userId' };
    }

    try {
      const { messageIds } = await this.messagesService.markConversationAsRead(
        conversationId,
        userId,
      );

      // Không có tin nào mới được đọc thì khỏi phát sự kiện cho người khác.
      if (messageIds.length > 0) {
        this.server.to(conversationId).emit('messagesRead', {
          conversationId,
          userId,
          messageIds,
        });
      }

      return { status: 'ok', messageIds };
    } catch (error) {
      return this.toErrorResponse(error, 'Đánh dấu đã đọc thất bại');
    }
  }

  // --------------------------------------------------------------------------
  // Các hàm dùng chung
  // --------------------------------------------------------------------------

  /** Tên room riêng của một user (gom mọi tab của người đó). */
  private getUserRoom(userId: string) {
    return `user:${userId}`;
  }

  /**
   * Gửi sự kiện tới TẤT CẢ thành viên của cuộc trò chuyện, kể cả người đang
   * không mở đoạn chat đó (nhờ room riêng của từng user).
   */
  private async emitToParticipants(
    conversationId: string,
    event: string,
    payload: unknown,
  ) {
    const conversation =
      await this.conversationsService.findById(conversationId);

    const rooms =
      conversation?.participants.map((participant) =>
        this.getUserRoom(this.getParticipantId(participant)),
      ) ?? [];

    // Không tìm thấy cuộc trò chuyện thì gửi tạm vào room của cuộc trò chuyện.
    // Không được truyền mảng rỗng cho .to(), vì khi đó Socket.IO gửi cho TẤT CẢ.
    const target = rooms.length > 0 ? rooms : conversationId;
    this.server.to(target).emit(event, payload);
  }

  /**
   * participants đã được .populate() nên mỗi phần tử là object user;
   * nếu chưa populate thì nó là ObjectId. Hàm này lấy ra id dạng chuỗi cho cả hai.
   */
  private getParticipantId(participant: unknown) {
    if (
      participant &&
      typeof participant === 'object' &&
      '_id' in participant
    ) {
      return String((participant as { _id: unknown })._id);
    }

    return String(participant);
  }

  /** Gom một chỗ: ghi log lỗi ở server và trả về thông báo gọn cho client. */
  private toErrorResponse(error: unknown, context: string) {
    const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra';
    this.logger.error(`${context}: ${message}`);

    return { status: 'error', message };
  }
}
