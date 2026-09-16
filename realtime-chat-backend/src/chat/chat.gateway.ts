import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { ConversationsService } from '../conversations/conversations.service';
import { ConversationDocument } from '../conversations/schemas/conversation.schema';
import { MessagesService } from '../messages/messages.service';
import type {
  ChatServer,
  ChatSocket,
  DeleteMessagePayload,
  JoinConversationPayload,
  MarkAsReadPayload,
  SendMessagePayload,
  TypingPayload,
  UpdateMessagePayload,
} from './chat.types';
import { PresenceService } from './presence.service';
import { WsAuthService } from './ws-auth.service';

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
 * XÁC THỰC: token được kiểm tra MỘT lần ở middleware lúc handshake, sau đó
 * userId nằm trong `client.data.userId`. Mọi handler đều lấy danh tính từ đó,
 * KHÔNG BAO GIỜ từ payload - client gửi gì lên cũng chỉ là dữ liệu.
 */
@WebSocketGateway({
  cors: { origin: '*' }, // khi deploy nên ghi rõ domain của frontend
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  /** Server của Socket.IO, dùng để gửi sự kiện cho client. */
  @WebSocketServer()
  server!: ChatServer;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly presenceService: PresenceService,
    private readonly wsAuthService: WsAuthService,
  ) {}

  // --------------------------------------------------------------------------
  // Kết nối / ngắt kết nối
  // --------------------------------------------------------------------------

  /**
   * Cửa duy nhất để vào hệ thống realtime.
   *
   * Đặt ở middleware chứ không ở handleConnection vì middleware chạy TRƯỚC khi
   * kết nối được thiết lập: token sai thì client không bao giờ "connect" được,
   * và không có khe thời gian nào để gửi sự kiện khi chưa xác thực xong.
   */
  afterInit(server: ChatServer) {
    server.use((socket, next) => {
      this.wsAuthService
        .authenticate(socket)
        .then((userId) => {
          if (!userId) {
            // Client nhận lỗi này ở sự kiện 'connect_error' và KHÔNG tự thử lại.
            next(new Error('Token không hợp lệ hoặc đã hết hạn'));

            return;
          }

          // Từ đây trở đi mọi handler đều đọc danh tính ở chỗ này.
          socket.data.userId = userId;
          next();
        })
        .catch((error: unknown) => {
          this.logger.error(
            `Lỗi khi xác thực socket: ${error instanceof Error ? error.message : 'không rõ'}`,
          );
          next(new Error('Xác thực thất bại'));
        });
    });
  }

  async handleConnection(client: ChatSocket) {
    const userId = this.getUserId(client);
    if (!userId) {
      // Middleware đã chặn hết rồi; nhánh này chỉ để chắc chắn.
      client.disconnect(true);

      return;
    }

    this.logger.log(`Socket kết nối: ${client.id} (user ${userId})`);

    // Vào room riêng của user để nhận tin nhắn mới kể cả khi đang xem đoạn chat khác.
    await client.join(this.getUserRoom(userId));
    this.presenceService.addSocket(userId, client.id);

    // Báo cho tất cả mọi người biết user này vừa online...
    this.server.emit('presence:update', { userId, online: true });

    // ...và gửi riêng cho người vừa vào danh sách những ai đang online.
    client.emit('presence:list', {
      onlineUserIds: this.presenceService.getOnlineUserIds(),
    });
  }

  handleDisconnect(client: ChatSocket) {
    this.logger.log(`Socket ngắt kết nối: ${client.id}`);

    const result = this.presenceService.removeSocket(client.id);
    if (!result) {
      return; // socket bị từ chối lúc handshake, chưa gắn với user nào
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

  /**
   * Xin lại danh sách người đang online.
   *
   * Việc đánh dấu online đã làm xong ở handleConnection; sự kiện này chỉ còn để
   * client hỏi lại danh sách (ví dụ sau khi tải xong danh bạ). Không nhận payload:
   * userId luôn là chủ của socket này.
   */
  @SubscribeMessage('presence:online')
  handlePresenceOnline(@ConnectedSocket() client: ChatSocket) {
    if (!this.getUserId(client)) {
      return this.unauthorized();
    }

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
  async handleJoinConversation(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: JoinConversationPayload,
  ) {
    const userId = this.getUserId(client);
    if (!userId) {
      return this.unauthorized();
    }

    const conversationId = payload?.conversationId;
    if (!conversationId) {
      return { status: 'error', message: 'Thiếu conversationId' };
    }

    // Không kiểm tra thì ai cũng vào được phòng của người khác và đọc lén
    // toàn bộ tin nhắn realtime của họ.
    const conversation = await this.findConversationFor(conversationId, userId);
    if (!conversation) {
      return {
        status: 'error',
        message: 'Không có quyền vào cuộc trò chuyện này',
      };
    }

    await client.join(conversationId);

    this.logger.log(`Socket ${client.id} vào phòng ${conversationId}`);

    return { status: 'joined', conversationId };
  }

  /** Gửi tin nhắn mới. */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const senderId = this.getUserId(client);
    if (!senderId) {
      return this.unauthorized();
    }

    try {
      // 1. Chỉ thành viên của cuộc trò chuyện mới được gửi vào đó.
      const conversation = await this.findConversationFor(
        payload.conversationId,
        senderId,
      );
      if (!conversation) {
        return {
          status: 'error',
          message: 'Không có quyền gửi vào cuộc trò chuyện này',
        };
      }

      // 2. Lưu tin nhắn vào database; người gửi lấy từ token, không từ payload.
      const message = await this.messagesService.create(senderId, {
        conversationId: payload.conversationId,
        content: payload.content ?? '',
        type: payload.type,
        imageUrl: payload.imageUrl,
      });

      // 3. Cập nhật "tin nhắn cuối" để danh sách chat sắp xếp lại đúng thứ tự.
      await this.conversationsService.updateLastMessage(
        payload.conversationId,
        message._id.toString(),
      );

      // 4. Gửi cho cả hai người, kể cả người đang xem đoạn chat khác.
      this.emitToParticipants(conversation, 'newMessage', message);

      return { status: 'sent', message };
    } catch (error) {
      return this.toErrorResponse(error, 'Gửi tin nhắn thất bại');
    }
  }

  /** Sửa nội dung tin nhắn. */
  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: UpdateMessagePayload,
  ) {
    const senderId = this.getUserId(client);
    if (!senderId) {
      return this.unauthorized();
    }

    try {
      // MessagesService.update tự từ chối nếu tin nhắn không phải của senderId.
      const message = await this.messagesService.update(
        payload.messageId,
        senderId,
        payload.content,
      );

      // Phòng để gửi lấy từ chính tin nhắn, không lấy từ payload: nếu không,
      // client có thể phát sự kiện vào phòng bất kỳ.
      this.server
        .to(message.conversationId.toString())
        .emit('messageUpdated', message);

      return { status: 'updated', message };
    } catch (error) {
      return this.toErrorResponse(error, 'Sửa tin nhắn thất bại');
    }
  }

  /** Xoá tin nhắn. */
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: DeleteMessagePayload,
  ) {
    const senderId = this.getUserId(client);
    if (!senderId) {
      return this.unauthorized();
    }

    try {
      // remove() trả về conversationId của tin nhắn vừa xoá (nguồn đáng tin).
      const { conversationId } = await this.messagesService.remove(
        payload.messageId,
        senderId,
      );

      this.server.to(conversationId).emit('messageDeleted', {
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
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: TypingPayload,
  ) {
    const userId = this.getUserId(client);
    if (!userId) {
      return this.unauthorized();
    }

    // Sự kiện này bắn theo từng phím gõ nên không truy vấn database: chỉ cần
    // socket đang ở trong phòng là đủ, mà muốn vào phòng thì đã phải qua
    // kiểm tra thành viên ở joinConversation rồi.
    if (!payload?.conversationId || !client.rooms.has(payload.conversationId)) {
      return { status: 'error', message: 'Chưa vào cuộc trò chuyện này' };
    }

    // client.to(...) gửi cho những người KHÁC trong phòng, không gửi lại cho chính mình.
    client.to(payload.conversationId).emit('userTyping', {
      conversationId: payload.conversationId,
      userId,
      isTyping: payload.isTyping,
    });

    return { status: 'ok' };
  }

  /** Đánh dấu đã đọc toàn bộ tin nhắn trong một cuộc trò chuyện. */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() payload: MarkAsReadPayload,
  ) {
    const userId = this.getUserId(client);
    if (!userId) {
      return this.unauthorized();
    }

    const conversationId = payload?.conversationId;
    if (!conversationId) {
      return { status: 'error', message: 'Thiếu conversationId' };
    }

    try {
      const conversation = await this.findConversationFor(
        conversationId,
        userId,
      );
      if (!conversation) {
        return {
          status: 'error',
          message: 'Không có quyền đọc cuộc trò chuyện này',
        };
      }

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

  /** Danh tính của socket, do handleConnection đặt sau khi xác thực JWT. */
  private getUserId(client: ChatSocket): string | null {
    const userId = client.data?.userId;

    return typeof userId === 'string' && userId.length > 0 ? userId : null;
  }

  /** Trả lời chung cho socket chưa xác thực (về lý thuyết không xảy ra). */
  private unauthorized() {
    return { status: 'error', message: 'Chưa xác thực' };
  }

  /**
   * Lấy cuộc trò chuyện và kiểm tra `userId` có thật sự là thành viên hay không.
   * Trả về null nếu không tồn tại HOẶC không phải thành viên - gộp hai trường hợp
   * làm một để người ngoài không dò được id nào có tồn tại.
   */
  private async findConversationFor(conversationId: string, userId: string) {
    const conversation =
      await this.conversationsService.findById(conversationId);

    if (!conversation) {
      return null;
    }

    const isParticipant = conversation.participants.some(
      (participant) => this.getParticipantId(participant) === userId,
    );

    return isParticipant ? conversation : null;
  }

  /** Tên room riêng của một user (gom mọi tab của người đó). */
  private getUserRoom(userId: string) {
    return `user:${userId}`;
  }

  /**
   * Gửi sự kiện tới TẤT CẢ thành viên của cuộc trò chuyện, kể cả người đang
   * không mở đoạn chat đó (nhờ room riêng của từng user).
   */
  private emitToParticipants(
    conversation: ConversationDocument,
    event: string,
    payload: unknown,
  ) {
    const rooms = conversation.participants.map((participant) =>
      this.getUserRoom(this.getParticipantId(participant)),
    );

    // Không được truyền mảng rỗng cho .to(), vì khi đó Socket.IO gửi cho TẤT CẢ.
    if (rooms.length === 0) {
      return;
    }

    this.server.to(rooms).emit(event, payload);
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
