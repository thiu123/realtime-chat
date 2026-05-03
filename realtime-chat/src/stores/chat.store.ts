import { create } from "zustand";
import { Conversation, Message } from "@/types/chat";
import { ApiUser, ApiMessage, ApiConversation } from "@/services/chat.service";

interface ChatState {
  // State
  conversations: Conversation[];
  activeConversationId: string;
  messages: Message[];
  users: ApiUser[];
  loading: boolean;
  onlineUsers: Record<string, boolean>;

  // Getters
  activeConversation: () => Conversation | undefined;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversationId: (id: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateConversationLastMessage: (
    conversationId: string,
    message: ApiMessage,
  ) => void;
  setUsers: (users: ApiUser[]) => void;
  setLoading: (loading: boolean) => void;
  addConversation: (conversation: Conversation) => void;
  setUserOnlineStatus: (userId: string, online: boolean) => void;
  markMessagesRead: (messageIds: string[], readerId: string) => void;
  reset: () => void;
}

export const toUIConversation = (
  conv: ApiConversation,
  userId: string,
): Conversation => {
  const otherUser = conv.participants.find((p) => p._id !== userId);
  return {
    id: conv._id,
    user: {
      id: otherUser?._id || "",
      name: otherUser?.name || "Unknown",
      avatar: otherUser?.avatar || "",
      online: false,
    },
    lastMessage: conv.lastMessage?.content || "No messages yet",
    timestamp: conv.lastMessageAt
      ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "",
  };
};

export const toUIMessage = (msg: ApiMessage): Message => {
  const sender = typeof msg.senderId === "object" ? msg.senderId : null;
  const senderId = sender?._id || (msg.senderId as string);
  const readBy = msg.readBy ?? [];
  return {
    id: msg._id,
    senderId,
    content: msg.content,
    // Map type từ API ('text' | 'emoji' | 'image') sang UI type
    type: (msg.type as "text" | "image" | "emoji") || "text",
    timestamp: msg.createdAt,
    // Map imageUrl từ API để hiển thị ảnh trong MessageBubble
    imageUrl: msg.imageUrl,
    readBy,
    read: readBy.length > 1,
  };
};

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  conversations: [],
  activeConversationId: "",
  messages: [],
  users: [],
  loading: true,
  onlineUsers: {},

  // Getters
  activeConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },

  // Actions
  setConversations: (conversations) =>
    set((state) => ({
      conversations: conversations.map((c) => ({
        ...c,
        user: {
          ...c.user,
          online: state.onlineUsers[c.user.id] ?? c.user.online ?? false,
        },
      })),
    })),

  setActiveConversationId: (id) => set({ activeConversationId: id }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => {
      if (state.messages.find((m) => m.id === message.id)) {
        return state;
      }
      return { messages: [...state.messages, message] };
    }),

  updateConversationLastMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: message.content,
              timestamp: new Date(message.createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              }),
            }
          : conv,
      ),
    })),

  setUsers: (users) =>
    set((state) => ({
      users: users.map((u) => ({
        ...u,
        online: state.onlineUsers[u._id] ?? u.online ?? false,
      })),
    })),

  setLoading: (loading) => set({ loading }),

  addConversation: (conversation) =>
    set((state) => {
      if (state.conversations.find((c) => c.id === conversation.id)) {
        return state;
      }
      return {
        conversations: [
          {
            ...conversation,
            user: {
              ...conversation.user,
              online:
                state.onlineUsers[conversation.user.id] ??
                conversation.user.online ??
                false,
            },
          },
          ...state.conversations,
        ],
      };
    }),

  setUserOnlineStatus: (userId, online) =>
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: online,
      },
      conversations: state.conversations.map((conv) =>
        conv.user.id === userId
          ? {
              ...conv,
              user: {
                ...conv.user,
                online,
              },
            }
          : conv,
      ),
      users: state.users.map((u) =>
        u._id === userId
          ? {
              ...u,
              online,
            }
          : u,
      ),
    })),

  markMessagesRead: (messageIds, readerId) =>
    set((state) => ({
      messages: state.messages.map((m) => {
        if (!messageIds.includes(m.id)) {
          return m;
        }

        const readBy = m.readBy ?? [];
        const nextReadBy = readBy.includes(readerId)
          ? readBy
          : [...readBy, readerId];

        return {
          ...m,
          readBy: nextReadBy,
          read: nextReadBy.length > 1,
        };
      }),
    })),

  reset: () =>
    set({
      conversations: [],
      activeConversationId: "",
      messages: [],
      users: [],
      loading: true,
      onlineUsers: {},
    }),
}));
