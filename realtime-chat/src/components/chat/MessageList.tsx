import { MessageBubble } from "./MessageBubble";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chat.store";
import { useAuthStore } from "@/stores/auth.store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday, isYesterday } from "date-fns";

export function MessageList() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = useChatStore((state) => state.messages);
  const currentUserId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!currentUserId) return null;

  const groupedMessages: { [key: string]: typeof messages } = {};
  messages.forEach((msg) => {
    const date = new Date(msg.timestamp);

    if (isNaN(date.getTime())) {
      return;
    }

    let dateLabel = format(date, "MMM dd, yyyy");

    if (isToday(date)) {
      dateLabel = "TODAY, " + format(date, "MMM dd").toUpperCase();
    } else if (isYesterday(date)) {
      dateLabel = "YESTERDAY";
    }

    if (!groupedMessages[dateLabel]) {
      groupedMessages[dateLabel] = [];
    }
    groupedMessages[dateLabel].push(msg);
  });

  return (
    <ScrollArea className="flex-1 bg-zinc-950">
      <div className="p-6">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <span className="text-xs text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">
                  {date}
                </span>
              </div>

              {msgs.map((message) => {
                const isMe = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <MessageBubble message={message} isMe={isMe} />
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
