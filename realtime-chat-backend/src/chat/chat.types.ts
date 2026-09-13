import { MessageType } from '../messages/schemas/message.schema';

/**
 * Kiểu dữ liệu của các sự kiện client gửi lên qua WebSocket.
 *
 * Khác với REST, payload WebSocket không đi qua ValidationPipe, nên đây chỉ là
 * "mô tả kiểu" lúc viết code; khi chạy vẫn phải tự kiểm tra dữ liệu thiếu.
 */

/** Sự kiện 'presence:online' - báo cho server biết mình vừa online. */
export interface PresenceOnlinePayload {
  userId: string;
}

/** Sự kiện 'joinConversation' - vào phòng của một cuộc trò chuyện. */
export interface JoinConversationPayload {
  conversationId: string;
}

/** Sự kiện 'sendMessage' - gửi tin nhắn mới. */
export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content?: string;
  type?: MessageType;
  imageUrl?: string;
}

/** Sự kiện 'updateMessage' - sửa nội dung tin nhắn. */
export interface UpdateMessagePayload {
  conversationId: string;
  messageId: string;
  senderId: string;
  content: string;
}

/** Sự kiện 'deleteMessage' - xoá tin nhắn. */
export interface DeleteMessagePayload {
  conversationId: string;
  messageId: string;
  senderId: string;
}

/** Sự kiện 'typing' - báo đang gõ / ngừng gõ. */
export interface TypingPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

/** Sự kiện 'markAsRead' - đánh dấu đã đọc cả cuộc trò chuyện. */
export interface MarkAsReadPayload {
  conversationId: string;
  userId: string;
}
