import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Trong production nên chỉ định cụ thể domain
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private messagesService: MessagesService,
    private conversationsService: ConversationsService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`✅ Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  /**
   * Join vào room của cuộc trò chuyện
   * Client gửi: { conversationId: string }
   */
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const { conversationId } = payload;

    client.join(conversationId);

    console.log(`👥 Client ${client.id} joined conversation ${conversationId}`);

    return { status: 'joined', conversationId };
  }

  /**
   * CREATE - Gửi tin nhắn mới (Realtime qua Socket)
   * Client gửi: { conversationId, senderId, content?, type?, imageUrl? }
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      conversationId: string;
      senderId: string;
      content?: string;    // Nội dung text (optional với tin nhắn ảnh)
      type?: string;       // 'text' | 'emoji' | 'image'
      imageUrl?: string;   // Ảnh base64 (chỉ khi type = 'image')
    },
  ) {
    try {
      // 1. Lưu tin nhắn vào database
      const newMessage = await this.messagesService.create(payload.senderId, {
        conversationId: payload.conversationId,
        content: payload.content || '',
        type: payload.type,
        imageUrl: payload.imageUrl,
      });

      console.log('New message saved:', newMessage._id);

      // 2. Cập nhật lastMessage trong conversation
      await this.conversationsService.updateLastMessage(
        payload.conversationId,
        newMessage._id.toString(),
      );

      // 3. Gửi tin nhắn đến tất cả người trong room (bao gồm cả người gửi)
      this.server.to(payload.conversationId).emit('newMessage', newMessage);

      // 4. Trả về cho người gửi
      return { status: 'sent', message: newMessage };
    } catch (error) {
      console.error('Error sending message:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * UPDATE - Sửa tin nhắn (Realtime qua Socket)
   * Client gửi: { messageId: string, senderId: string, content: string, conversationId: string }
   */
  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      messageId: string;
      senderId: string;
      content: string;
      conversationId: string;
    },
  ) {
    try {
      // 1. Cập nhật tin nhắn trong database
      const updatedMessage = await this.messagesService.update(
        payload.messageId,
        payload.senderId,
        payload.content,
      );

      console.log(' Message updated:', updatedMessage._id);

      // 2. Gửi tin nhắn đã sửa đến tất cả người trong room
      this.server
        .to(payload.conversationId)
        .emit('messageUpdated', updatedMessage);

      return { status: 'updated', message: updatedMessage };
    } catch (error) {
      console.error(' Error updating message:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * DELETE - Xóa tin nhắn (Realtime qua Socket)
   * Client gửi: { messageId: string, senderId: string, conversationId: string }
   */
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      messageId: string;
      senderId: string;
      conversationId: string;
    },
  ) {
    try {
      // 1. Xóa tin nhắn trong database
      const result = await this.messagesService.delete(
        payload.messageId,
        payload.senderId,
      );

      console.log('Message deleted:', payload.messageId);

      // 2. Thông báo cho tất cả người trong room
      this.server.to(payload.conversationId).emit('messageDeleted', {
        messageId: payload.messageId,
      });

      return { status: 'deleted', ...result };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Typing indicator
   * Client gửi: { conversationId: string, userId: string, isTyping: boolean }
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    },
  ) {
    // Gửi cho tất cả người khác trong room (không gửi lại cho chính người gửi)
    client.to(payload.conversationId).emit('userTyping', {
      userId: payload.userId,
      isTyping: payload.isTyping,
    });
  }
}
