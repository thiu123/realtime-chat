import { MessageBubble } from "./MessageBubble";
import { ChatAvatar } from "./Avatar";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chat.store";
import { useAuthStore } from "@/stores/auth.store";

export function MessageList() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const messages = useChatStore((state) => state.messages);
  const activeConversation = useChatStore((state) =>
    state.activeConversation(),
  );
  const currentUserId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!activeConversation || !currentUserId) return null;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-thin p-4"
    >
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      )}
      {messages.map((message) => {
        const isMe = message.senderId === currentUserId;
        return (
          <div
            key={message.id}
            className={`flex mb-2 items-center ${isMe ? "justify-end" : "justify-start"}`}
          >
            {
              <div className="flex flex-col justify-center items-center mr-2">
                <ChatAvatar
                  src={
                    activeConversation?.user?.avatar
                      ? activeConversation.user.avatar
                      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
                  }
                  alt={activeConversation?.user?.name || "User avatar"}
                  size="sm"
                />
              </div>
            }
            <div className="h-full">
              <MessageBubble message={message} />
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
