import { api } from "@/lib/axios";

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ApiMessage {
  _id: string;
  conversationId: string;
  senderId: ApiUser | string;
  content: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiConversation {
  _id: string;
  participants: ApiUser[];
  lastMessage?: ApiMessage;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lấy danh sách tất cả users (để chọn người chat)
 */
export const getUsers = async (): Promise<ApiUser[]> => {
  const response = await api.get("/users");
  return response.data;
};

/**
 * Lấy danh sách conversations của user
 */
export const getConversations = async (
  userId: string
): Promise<ApiConversation[]> => {
  const response = await api.get(`/conversations?userId=${userId}`);
  return response.data;
};

/**
 * Tạo hoặc lấy conversation giữa 2 users
 */
export const createOrGetConversation = async (
  userId: string,
  participantId: string
): Promise<ApiConversation> => {
  const response = await api.post("/conversations", { userId, participantId });
  return response.data;
};

/**
 * Lấy tin nhắn của conversation
 */
export const getMessages = async (
  conversationId: string
): Promise<ApiMessage[]> => {
  const response = await api.get(`/messages/conversation/${conversationId}`);
  return response.data;
};
