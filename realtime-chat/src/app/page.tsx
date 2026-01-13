"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useAuthStore } from "@/stores/auth.store";
import { socketService } from "@/services/socket.service";
import {
  getConversations,
  getMessages,
  getUsers,
  createOrGetConversation,
  ApiConversation,
  ApiMessage,
  ApiUser,
} from "@/services/chat.service";
import { Conversation, Message } from "@/types/chat";

// Chuyển API data sang UI format
const toUIConversation = (
  conv: ApiConversation,
  userId: string
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
    lastMessage: conv.lastMessage?.content || "Chưa có tin nhắn",
    timestamp: conv.lastMessageAt
      ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "",
  };
};

const toUIMessage = (msg: ApiMessage): Message => {
  const sender = typeof msg.senderId === "object" ? msg.senderId : null;
  return {
    id: msg._id,
    senderId: sender?._id || (msg.senderId as string),
    content: msg.content,
    type: "text",
    timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
};

const Index = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // Load dữ liệu ban đầu
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [usersData, conversationsData] = await Promise.all([
          getUsers(),
          getConversations(user.id),
        ]);

        setUsers(usersData.filter((u) => u._id !== user.id));
        const formattedConvs = conversationsData.map((c) =>
          toUIConversation(c, user.id)
        );
        setConversations(formattedConvs);

        if (formattedConvs.length > 0) {
          setActiveConversationId(formattedConvs[0].id);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router]);

  // Kết nối Socket
  useEffect(() => {
    if (!accessToken) return;
    socketService.connect(accessToken);
    return () => socketService.disconnect();
  }, [accessToken]);

  // Load messages khi chọn conversation
  useEffect(() => {
    if (!activeConversationId) return;

    socketService.emit("joinConversation", {
      conversationId: activeConversationId,
    });

    const loadMessages = async () => {
      try {
        const messagesData = await getMessages(activeConversationId);
        setMessages(messagesData.map(toUIMessage));
      } catch (error) {
        console.error("Error:", error);
      }
    };

    loadMessages();
  }, [activeConversationId]);

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    const handleNewMessage = (newMsg: ApiMessage) => {
      // Thêm tin nhắn vào conversation đang active
      if (newMsg.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg._id)) return prev;
          return [...prev, toUIMessage(newMsg)];
        });
      }

      // Cập nhật lastMessage trong danh sách conversations
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === newMsg.conversationId
            ? {
                ...conv,
                lastMessage: newMsg.content,
                timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                }),
              }
            : conv
        )
      );
    };

    socketService.on("newMessage", handleNewMessage);
    return () => socketService.off("newMessage");
  }, [activeConversationId]);

  // Gửi tin nhắn
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!user || !activeConversationId) return;

      socketService.emit("sendMessage", {
        conversationId: activeConversationId,
        senderId: user.id,
        content,
      });
    },
    [user, activeConversationId]
  );

  // Bắt đầu chat với user
  const handleStartChat = useCallback(
    async (participantId: string) => {
      if (!user) return;

      try {
        const conversation = await createOrGetConversation(
          user.id,
          participantId
        );
        const formatted = toUIConversation(conversation, user.id);

        setConversations((prev) => {
          if (prev.find((c) => c.id === formatted.id)) return prev;
          return [formatted, ...prev];
        });

        setActiveConversationId(formatted.id);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [user]
  );

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="flex flex-col w-95 border-r border-border bg-card">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={setActiveConversationId}
          users={users}
          onStartChat={handleStartChat}
        />
      </div>

      {activeConversation ? (
        <ChatPanel
          user={activeConversation.user}
          messages={messages}
          currentUserId={user.id}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <p className="text-muted-foreground">
            Chọn một cuộc trò chuyện hoặc bắt đầu chat mới
          </p>
        </div>
      )}
    </div>
  );
};

export default Index;
