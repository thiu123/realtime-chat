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
import { Conversation, Message, User } from "@/types/chat";

// Helper: Chuyển đổi API data sang UI format
const formatConversation = (
  conv: ApiConversation,
  currentUserId: string
): Conversation => {
  // Lấy người còn lại trong conversation (không phải mình)
  const otherUser = conv.participants.find((p) => p._id !== currentUserId);

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

const formatMessage = (msg: ApiMessage): Message => {
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

  // Lấy conversation đang active
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // Load conversations & users khi component mount
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // Load users và conversations cùng lúc
        const [usersData, conversationsData] = await Promise.all([
          getUsers(),
          getConversations(user.id),
        ]);

        setUsers(usersData.filter((u) => u._id !== user.id)); // Loại bỏ chính mình

        const formattedConversations = conversationsData.map((c) =>
          formatConversation(c, user.id)
        );
        setConversations(formattedConversations);

        // Chọn conversation đầu tiên nếu có
        if (formattedConversations.length > 0) {
          setActiveConversationId(formattedConversations[0].id);
        }
      } catch (error) {
        console.error("Error loading data:", error);
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

    return () => {
      socketService.disconnect();
    };
  }, [accessToken]);

  // Join room và load messages khi chọn conversation
  useEffect(() => {
    if (!activeConversationId) return;

    // Join vào room của conversation
    socketService.emit("joinConversation", {
      conversationId: activeConversationId,
    });

    // Load messages
    const loadMessages = async () => {
      try {
        const messagesData = await getMessages(activeConversationId);
        setMessages(messagesData.map(formatMessage));
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [activeConversationId]);

  // Lắng nghe tin nhắn mới từ Socket
  useEffect(() => {
    const handleNewMessage = (newMsg: ApiMessage) => {
      console.log("📨 Received new message:", newMsg);

      // Thêm tin nhắn mới vào danh sách
      setMessages((prev) => [...prev, formatMessage(newMsg)]);

      // Cập nhật lastMessage trong conversation list
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

    return () => {
      socketService.off("newMessage");
    };
  }, []);

  // Gửi tin nhắn
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!user || !activeConversationId) {
        console.warn("Cannot send message:", { user, activeConversationId });
        return;
      }

      console.log("📤 Sending message:", {
        conversationId: activeConversationId,
        senderId: user.id,
        content,
      });

      // Gửi qua Socket
      socketService.emit("sendMessage", {
        conversationId: activeConversationId,
        senderId: user.id,
        content,
      });
    },
    [user, activeConversationId]
  );

  // Bắt đầu chat với user mới
  const handleStartChat = useCallback(
    async (participantId: string) => {
      if (!user) return;

      try {
        const conversation = await createOrGetConversation(
          user.id,
          participantId
        );
        const formatted = formatConversation(conversation, user.id);

        // Kiểm tra conversation đã tồn tại chưa
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === formatted.id);
          if (exists) return prev;
          return [formatted, ...prev];
        });

        setActiveConversationId(formatted.id);
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    },
    [user]
  );

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Đang tải...</p>
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
