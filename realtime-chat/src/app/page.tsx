"use client";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useAuthStore } from "@/stores/auth.store";
import {
  useChatStore,
  toUIConversation,
  toUIMessage,
} from "@/stores/chat.store";
import { socketService } from "@/services/socket.service";
import {
  getConversations,
  getMessages,
  getUsers,
  createOrGetConversation,
  ApiMessage,
} from "@/services/chat.service";

const Index = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  // Chat store
  const {
    activeConversationId,
    loading,
    activeConversation,
    setConversations,
    setActiveConversationId,
    setMessages,
    addMessage,
    updateConversationLastMessage,
    setUsers,
    setLoading,
    addConversation,
  } = useChatStore();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

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
  }, [
    user,
    router,
    setLoading,
    setUsers,
    setConversations,
    setActiveConversationId,
  ]);

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
  }, [activeConversationId, setMessages]);

  useEffect(() => {
    const handleNewMessage = (newMsg: ApiMessage) => {
      if (newMsg.conversationId === activeConversationId) {
        addMessage(toUIMessage(newMsg));
      }

      updateConversationLastMessage(newMsg.conversationId, newMsg);
    };

    socketService.on("newMessage", handleNewMessage);
    return () => socketService.off("newMessage");
  }, [activeConversationId, addMessage, updateConversationLastMessage]);

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
  // const handleStartChat = useCallback(async (participantId: string) => {
  //   if (!user) return;

  //   try {
  //     const conversation = await createOrGetConversation(
  //       user.id,
  //       participantId
  //     );
  //     const formatted = toUIConversation(conversation, user.id);

  //     addConversation(formatted);
  //     setActiveConversationId(formatted.id);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // }, [user][(user, addConversation, setActiveConversationId)]);

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
        <ConversationList />
      </div>

      {activeConversation() ? (
        <ChatPanel onSendMessage={handleSendMessage} />
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
