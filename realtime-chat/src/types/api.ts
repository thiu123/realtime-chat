/**
 * Kiểu dữ liệu ĐÚNG NHƯ backend trả về (MongoDB dùng `_id`).
 * Trước khi đưa lên UI, các kiểu này được đổi sang kiểu trong `types/chat.ts`
 * bằng `toUIConversation` / `toUIMessage` trong `stores/chat.store.ts`.
 */

/** Loại tin nhắn backend hỗ trợ. */
export type MessageType = "text" | "emoji" | "image";

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  /** Do client tự gắn thêm dựa trên sự kiện presence, backend không trả về. */
  online?: boolean;
}

export interface ApiMessage {
  _id: string;
  conversationId: string;
  /** Đã populate thì là object user, chưa populate thì chỉ là id. */
  senderId: ApiUser | string;
  content: string;
  type: MessageType;
  /** Ảnh dạng base64, chỉ có khi type = "image". */
  imageUrl?: string;
  /** Id những người đã đọc tin nhắn này. */
  readBy?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiConversation {
  _id: string;
  participants: ApiUser[];
  lastMessage?: ApiMessage;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Kết quả của POST /auth/login và POST /auth/signup. */
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}
