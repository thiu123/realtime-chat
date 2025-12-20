"use client";
import { useState } from "react";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { UserProfileButton } from "@/components/chat/UserProfile";
import { conversations, messages } from "@/data/mockData";
import { Message } from "@/types/chat";

const Index = () => {
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: "me",
      content,
      type: "text",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      read: false,
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  if (!activeConversation) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="flex flex-col w-[380px] border-r border-border bg-card">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={setActiveConversationId}
        />
      </div>
      <ChatPanel
        user={activeConversation.user}
        messages={chatMessages}
        currentUserId="me"
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default Index;
