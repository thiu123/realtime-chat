"use client";
import { useEffect, useCallback } from "react";
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

const Index = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

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

  const handleSendMessage = useCallback(
    (content: string, type?: string, imageUrl?: string) => {
      if (!user || !activeConversationId) return;

      socketService.emit("sendMessage", {
        conversationId: activeConversationId,
        senderId: user.id,
        content,
        type,        // Gửi loại tin nhắn (text, emoji, image)
        imageUrl,    // Gửi ảnh dạng base64 (nếu có)
      });
    },
    [user, activeConversationId],
  );

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        Loading...
      </div>
    );
  }

  const currentConv = activeConversation();

  return (
    <div className="h-screen w-full overflow-hidden bg-zinc-950">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={5}
          minSize={4}
          maxSize={6}
          className="min-w-16"
        >
          <AppSidebar currentUser={user} />
        </ResizablePanel>

        <ResizableHandle className="w-px bg-zinc-800" />

        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <ConversationList />
        </ResizablePanel>

        <ResizableHandle className="w-px bg-zinc-800" />

        <ResizablePanel defaultSize={50} minSize={30}>
          <ChatPanel onSendMessage={handleSendMessage} />
        </ResizablePanel>

        {currentConv && (
          <>
            <ResizableHandle className="w-px bg-zinc-800" />
            <ResizablePanel
              defaultSize={25}
              minSize={20}
              maxSize={35}
              className="hidden lg:block"
            >
              <UserDetailPanel user={currentConv.user} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
