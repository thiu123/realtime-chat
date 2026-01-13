import { Message, User } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { ChatAvatar } from "./Avatar";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  otherUser: User;
}

export function MessageList({
  messages,
  currentUserId,
  otherUser,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
        return (
          <div key={message.id} className="flex gap-2">
            {
              <div className="flex flex-col justify-end">
                <ChatAvatar
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  size="sm"
                />
              </div>
            }
            <div>
              <MessageBubble message={message} />
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
