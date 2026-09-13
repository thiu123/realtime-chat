/**
 * Kiểu dữ liệu dùng cho phần giao diện.
 * Đơn giản hơn kiểu API: dùng `id` thay cho `_id`, và chỉ giữ những gì UI cần vẽ.
 */

export interface User {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content?: string;
  /** Chuỗi ISO, ví dụ "2026-09-13T10:37:14.137Z". */
  timestamp: string;
  type: "text" | "image" | "emoji";
  /** Ảnh dạng base64 (chỉ có khi type = "image"). */
  imageUrl?: string;
  /** Id những người đã đọc, dùng để hiện dấu tích đôi. */
  readBy?: string[];
  /** true khi có người khác ngoài người gửi đã đọc. */
  read?: boolean;
}

export interface Conversation {
  id: string;
  /** Người còn lại trong cuộc trò chuyện (không phải mình). */
  user: User;
  /** Nội dung rút gọn của tin nhắn cuối, để hiện ở danh sách chat. */
  lastMessage: string;
  /** Giờ của tin nhắn cuối, đã format sẵn để hiển thị. */
  timestamp: string;
  unreadCount?: number;
}
