import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Trong production nên chỉ định cụ thể domain
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // TODO: Inject services bạn cần
  // constructor(
  //   private messagesService: MessagesService,
  //   private conversationsService: ConversationsService,
  // ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // TODO: Handle user authentication
    // TODO: Join user to their conversation rooms
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // TODO: Update user status to offline
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: any) {
    // TODO: Implement logic
    // 1. Validate payload (conversationId, content)
    // 2. Save message to database
    // 3. Emit message to all participants in conversation

    console.log('Received message:', payload);

    // Example emit:
    // this.server.to(conversationId).emit('newMessage', savedMessage);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(client: Socket, conversationId: string) {
    // TODO: Implement logic
    // 1. Verify user has access to conversation
    // 2. Join socket room

    client.join(conversationId);
    console.log(`Client ${client.id} joined conversation ${conversationId}`);
  }

  @SubscribeMessage('typing')
  async handleTyping(
    client: Socket,
    payload: { conversationId: string; isTyping: boolean },
  ) {
    // TODO: Broadcast typing status to other users in conversation

    client.to(payload.conversationId).emit('userTyping', {
      userId: 'TODO', // Get from client auth
      isTyping: payload.isTyping,
    });
  }
}
