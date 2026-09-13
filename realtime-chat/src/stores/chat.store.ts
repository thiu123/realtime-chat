import { create } from "zustand";

import { formatTime, getConversationPreview, getSenderId } from "@/lib/chat-mappers";
import type { ApiMessage, ApiUser } from "@/types/api";
import type { Conversation, Message } from "@/types/chat";

/**
 * Kho dữ liệu chung của màn hình chat (Zustand).
 *
 * Store chỉ giữ state và các hàm sửa state. Việc gọi API nằm ở `services/`,
 * việc lắng nghe socket nằm ở `hooks/useChatSocket.ts`.
 */

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string;
  messages: Message[];
  /** Danh sách người có thể bắt đầu chat (đã bỏ chính mình). */
  users: ApiUser[];
  loading: boolean;
  /** userId -> đang online hay không. Nhớ riêng để gắn lại mỗi khi nạp dữ liệu mới. */
  onlineUsers: Record<string, boolean>;
}

interface ChatActions {
  activeConversation: () => Conversation | undefined;

  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  setActiveConversationId: (conversationId: string) => void;

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessageContent: (messageId: string, content: string) => void;
  removeMessage: (messageId: string) => void;

  setUsers: (users: ApiUser[]) => void;
  setLoading: (loading: boolean) => void;
  setUserOnlineStatus: (userId: string, online: boolean) => void;

  /** Cập nhật dòng xem trước + đẩy cuộc trò chuyện lên đầu danh sách. */
  applyIncomingMessage: (
    message: ApiMessage,
    context: { activeConversationId: string; currentUserId: string },
  ) => void;
  markMessagesRead: (messageIds: string[], readerId: string) => void;
  markConversationRead: (conversationId: string) => void;

  /** Xoá sạch state, gọi khi đăng xuất để người sau không thấy chat của người trước. */
  reset: () => void;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: "",
  messages: [],
  users: [],
  loading: true,
  onlineUsers: {},
};

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  ...initialState,

  activeConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find(
      (conversation) => conversation.id === activeConversationId,
    );
  },

  setConversations: (conversations) =>
    set((state) => ({
      conversations: conversations.map((conversation) => ({
        ...conversation,
        user: {
          ...conversation.user,
          online: state.onlineUsers[conversation.user.id] ?? false,
        },
      })),
    })),

  addConversation: (conversation) =>
    set((state) => {
      const exists = state.conversations.some(
        (item) => item.id === conversation.id,
      );
      if (exists) return state;

      return {
        conversations: [
          {
            ...conversation,
            user: {
              ...conversation.user,
              online: state.onlineUsers[conversation.user.id] ?? false,
            },
          },
          ...state.conversations,
        ],
      };
    }),

  setActiveConversationId: (conversationId) =>
    set((state) => ({
      activeConversationId: conversationId,
      // Mở cuộc trò chuyện nào thì xoá luôn số tin chưa đọc của nó.
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    })),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => {
      // Người gửi cũng nhận lại sự kiện newMessage nên phải chống trùng.
      const exists = state.messages.some((item) => item.id === message.id);
      if (exists) return state;

      return { messages: [...state.messages, message] };
    }),

  updateMessageContent: (messageId, content) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, content } : message,
      ),
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== messageId),
    })),

  setUsers: (users) =>
    set((state) => ({
      users: users.map((user) => ({
        ...user,
        online: state.onlineUsers[user._id] ?? false,
      })),
    })),

  setLoading: (loading) => set({ loading }),

  setUserOnlineStatus: (userId, online) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [userId]: online },
      conversations: state.conversations.map((conversation) =>
        conversation.user.id === userId
          ? { ...conversation, user: { ...conversation.user, online } }
          : conversation,
      ),
      users: state.users.map((user) =>
        user._id === userId ? { ...user, online } : user,
      ),
    })),

  applyIncomingMessage: (message, context) =>
    set((state) => {
      // Chỉ cộng tin chưa đọc khi tin của người khác VÀ mình đang không mở đoạn chat đó.
      const isFromSomeoneElse =
        getSenderId(message) !== context.currentUserId;
      const isConversationClosed =
        message.conversationId !== context.activeConversationId;
      const shouldIncrementUnread = isFromSomeoneElse && isConversationClosed;

      const target = state.conversations.find(
        (conversation) => conversation.id === message.conversationId,
      );
      if (!target) return state;

      const updated: Conversation = {
        ...target,
        lastMessage: getConversationPreview(message),
        timestamp: formatTime(message.createdAt),
        unreadCount: shouldIncrementUnread
          ? (target.unreadCount ?? 0) + 1
          : (target.unreadCount ?? 0),
      };

      // Đưa lên đầu danh sách giống các app chat khác.
      return {
        conversations: [
          updated,
          ...state.conversations.filter(
            (conversation) => conversation.id !== message.conversationId,
          ),
        ],
      };
    }),

  markMessagesRead: (messageIds, readerId) =>
    set((state) => ({
      messages: state.messages.map((message) => {
        if (!messageIds.includes(message.id)) return message;

        const readBy = message.readBy ?? [];
        const nextReadBy = readBy.includes(readerId)
          ? readBy
          : [...readBy, readerId];

        return { ...message, readBy: nextReadBy, read: nextReadBy.length > 1 };
      }),
    })),

  markConversationRead: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    })),

  reset: () => set(initialState),
}));
