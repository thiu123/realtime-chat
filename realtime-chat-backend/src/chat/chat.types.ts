import type { DefaultEventsMap, Server, Socket } from 'socket.io';

import { MessageType } from '../messages/schemas/message.schema';

/**
 * Kiểu dữ liệu của các sự kiện client gửi lên qua WebSocket.
 *
 * Khác với REST, payload WebSocket không đi qua ValidationPipe, nên đây chỉ là
 * "mô tả kiểu" lúc viết code; khi chạy vẫn phải tự kiểm tra dữ liệu thiếu.
 *
 * Cố ý KHÔNG có senderId / userId: danh tính người gửi luôn lấy từ JWT đã được
 * xác thực lúc handshake (xem WsAuthService), không bao giờ lấy từ payload.
 */

/** Sự kiện 'joinConversation' - vào phòng của một cuộc trò chuyện. */
export interface JoinConversationPayload {
  conversationId: string;
}

/** Sự kiện 'sendMessage' - gửi tin nhắn mới. */
export interface SendMessagePayload {
  conversationId: string;
  content?: string;
  type?: MessageType;
  imageUrl?: string;
}

/** Sự kiện 'updateMessage' - sửa nội dung tin nhắn. */
export interface UpdateMessagePayload {
  messageId: string;
  content: string;
}

/** Sự kiện 'deleteMessage' - xoá tin nhắn. */
export interface DeleteMessagePayload {
  messageId: string;
}

/** Sự kiện 'typing' - báo đang gõ / ngừng gõ. */
export interface TypingPayload {
  conversationId: string;
  isTyping: boolean;
}

/** Sự kiện 'markAsRead' - đánh dấu đã đọc cả cuộc trò chuyện. */
export interface MarkAsReadPayload {
  conversationId: string;
}

/**
 * Dữ liệu server tự gắn vào socket (không phải do client gửi).
 * `userId` được đặt ở ChatGateway.handleConnection sau khi JWT được xác thực.
 */
export interface ChatSocketData {
  userId?: string;
}

/**
 * Socket đã biết kiểu của `client.data`, nhờ vậy đọc `client.data.userId`
 * vẫn được TypeScript kiểm tra thay vì rơi về `any`.
 */
export type ChatSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  ChatSocketData
>;

/** Server đã biết kiểu của `socket.data` (dùng cho middleware ở afterInit). */
export type ChatServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  ChatSocketData
>;
