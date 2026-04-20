"use client";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/chat/AppSidebar";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { UserDetailPanel } from "@/components/chat/UserDetailPanel";
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
  ApiMessage,
} from "@/services/chat.service";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { MessageSquare } from "lucide-react";

const Index = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [typingUser, setTypingUser] = useState<string | undefined>();

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
          toUIConversation(c, user.id),
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
    hasHydrated,
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

  useEffect(() => {
    if (!activeConversationId) return;

    setTypingUser(undefined);

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
    const handleUserTyping = (payload: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (payload.conversationId !== activeConversationId) {
        return;
      }

      if (payload.userId === user?.id) {
        return;
      }

      if (payload.isTyping) {
        const conversation = activeConversation();
        setTypingUser(conversation?.user.name || "User");
        return;
      }

      setTypingUser(undefined);
    };

    const handleNewMessage = (newMsg: ApiMessage) => {
      if (newMsg.conversationId === activeConversationId) {
        addMessage(toUIMessage(newMsg));
      }

      updateConversationLastMessage(newMsg.conversationId, newMsg);
    };

    socketService.on("userTyping", handleUserTyping);
    socketService.on("newMessage", handleNewMessage);
    return () => {
      socketService.off("userTyping");
      socketService.off("newMessage");
    };
  }, [activeConversationId, activeConversation, user?.id, addMessage, updateConversationLastMessage]);

  const handleSendMessage = useCallback(
    (content: string, type?: string, imageUrl?: string) => {
      if (!user || !activeConversationId) return;

      socketService.emit("sendMessage", {
        conversationId: activeConversationId,
        senderId: user.id,
        content,
        type,
        imageUrl,
      });
    },
    [user, activeConversationId],
  );

    const handleTypingChange = useCallback(
      (isTyping: boolean) => {
        if (!user || !activeConversationId) return;

        socketService.emit("typing", {
          conversationId: activeConversationId,
          userId: user.id,
          isTyping,
        });
      },
      [user, activeConversationId],
    );

  if (!user) return null;

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center noise-bg"
        style={{ background: "var(--nx-surface-0)" }}
      >
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center accent-gradient animate-glow-pulse"
          >
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--nx-accent-400)", animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--nx-accent-400)", animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--nx-accent-400)", animationDelay: "300ms" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--nx-text-tertiary)" }}>
            Loading your conversations...
          </p>
        </div>
      </div>
    );
  }

  const currentConversation = activeConversation();

  return (
    <div className="h-screen w-full overflow-hidden noise-bg" style={{ background: "var(--nx-surface-0)" }}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={5}
          minSize={4}
          maxSize={6}
          className="min-w-16"
        >
          <AppSidebar currentUser={user} />
        </ResizablePanel>

        <ResizableHandle className="w-px" style={{ background: "var(--nx-glass-border)" }} />

        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <ConversationList />
        </ResizablePanel>

        <ResizableHandle className="w-px" style={{ background: "var(--nx-glass-border)" }} />

        <ResizablePanel defaultSize={50} minSize={30}>
          <ChatPanel
            onSendMessage={handleSendMessage}
            isTyping={Boolean(typingUser)}
            typingUser={typingUser}
            onTypingChange={handleTypingChange}
          />
        </ResizablePanel>

        {currentConversation && (
          <>
            <ResizableHandle className="w-px" style={{ background: "var(--nx-glass-border)" }} />
            <ResizablePanel
              defaultSize={25}
              minSize={20}
              maxSize={35}
              className="hidden lg:block"
            >
              <UserDetailPanel user={currentConversation.user} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
