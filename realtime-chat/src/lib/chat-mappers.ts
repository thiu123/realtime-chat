import type { ApiConversation, ApiMessage } from "@/types/api";
import type { Conversation, Message } from "@/types/chat";

/**
 * Chuyển dữ liệu từ backend (ApiXxx) sang dữ liệu cho giao diện (types/chat).
 * Gom về một file để khi backend đổi field, chỉ phải sửa ở đây.
 */

/** Giờ hiển thị cạnh mỗi cuộc trò chuyện, ví dụ "9:41 PM". */
export const formatTime = (isoDate: string): string =>
  new Date(isoDate).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

/** senderId có thể là object đã populate hoặc chỉ là id — luôn lấy ra id. */
export const getSenderId = (message: ApiMessage): string =>
  typeof message.senderId === "object" ? message.senderId._id : message.senderId;

/** Dòng chữ xem trước hiển thị dưới tên người trong danh sách chat. */
export const getConversationPreview = (message?: ApiMessage): string => {
  if (!message) return "No messages yet";
  if (message.type === "image" && !message.content) return "Photo";

  return message.content || "New message";
};

export const toUIConversation = (
  conversation: ApiConversation,
  currentUserId: string,
): Conversation => {
  // Chat 1-1 nên "người kia" là người tham gia không phải mình.
  const otherUser = conversation.participants.find(
    (participant) => participant._id !== currentUserId,
  );

  return {
    id: conversation._id,
    user: {
      id: otherUser?._id ?? "",
      name: otherUser?.name ?? "Unknown",
      avatar: otherUser?.avatar ?? "",
      online: false, // sẽ được cập nhật lại qua sự kiện presence
    },
    lastMessage: getConversationPreview(conversation.lastMessage),
    timestamp: conversation.lastMessageAt
      ? formatTime(conversation.lastMessageAt)
      : "",
    unreadCount: conversation.unreadCount ?? 0,
  };
};

export const toUIMessage = (message: ApiMessage): Message => {
  const readBy = message.readBy ?? [];

  return {
    id: message._id,
    senderId: getSenderId(message),
    content: message.content,
    type: message.type || "text",
    timestamp: message.createdAt,
    imageUrl: message.imageUrl,
    readBy,
    // Người gửi luôn nằm sẵn trong readBy, nên >1 nghĩa là người kia đã đọc.
    read: readBy.length > 1,
  };
};
