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
  return {
    id: msg._id,
    senderId: sender?._id || (msg.senderId as string),
    content: msg.content,
    type: "text",
    timestamp: msg.createdAt,
  };
};

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  conversations: [],
  activeConversationId: "",
  messages: [],
  users: [],
  loading: true,

  // Getters
  activeConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },

  // Actions
  setConversations: (conversations) => set({ conversations }),

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

  setUsers: (users) => set({ users }),

  setLoading: (loading) => set({ loading }),

  addConversation: (conversation) =>
    set((state) => {
      if (state.conversations.find((c) => c.id === conversation.id)) {
        return state;
      }
      return { conversations: [conversation, ...state.conversations] };
    }),

  reset: () =>
    set({
      conversations: [],
      activeConversationId: "",
      messages: [],
      users: [],
      loading: true,
    }),
}));
