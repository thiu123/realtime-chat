import { api } from "@/lib/axios";
import type { ApiConversation, ApiMessage, ApiUser } from "@/types/api";

/**
 * Các lời gọi REST API tới backend NestJS.
 * File này chỉ lo "gọi API và trả dữ liệu về", không chứa logic giao diện.
 */

/** Danh sách tất cả người dùng, để chọn người muốn nhắn tin. */
export const getUsers = async (): Promise<ApiUser[]> => {
  const response = await api.get<ApiUser[]>("/users");
  return response.data;
};

/** Danh sách cuộc trò chuyện của một người, kèm số tin chưa đọc. */
export const getConversations = async (
  userId: string,
): Promise<ApiConversation[]> => {
  const response = await api.get<ApiConversation[]>("/conversations", {
    params: { userId },
  });
  return response.data;
};

export const getConversation = async (
  conversationId: string,
): Promise<ApiConversation> => {
  const response = await api.get<ApiConversation>(
    `/conversations/${conversationId}`,
  );
  return response.data;
};

/** Lấy cuộc trò chuyện giữa 2 người; backend tự tạo mới nếu chưa có. */
export const createOrGetConversation = async (
  userId: string,
  participantId: string,
): Promise<ApiConversation> => {
  const response = await api.post<ApiConversation>("/conversations", {
    userId,
    participantId,
  });
  return response.data;
};

/** Lịch sử tin nhắn của một cuộc trò chuyện (cũ -> mới). */
export const getMessages = async (
  conversationId: string,
): Promise<ApiMessage[]> => {
  const response = await api.get<ApiMessage[]>(
    `/messages/conversation/${conversationId}`,
  );
  return response.data;
};

/**
 * Đổi ảnh đại diện.
 * @param avatarBase64 chuỗi base64, ví dụ "data:image/png;base64,..."
 */
export const updateUserAvatar = async (
  userId: string,
  avatarBase64: string,
): Promise<ApiUser> => {
  const response = await api.patch<ApiUser>(`/users/${userId}/avatar`, {
    avatar: avatarBase64,
  });
  return response.data;
};
