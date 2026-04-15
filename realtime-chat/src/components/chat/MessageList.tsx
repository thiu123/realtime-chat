import { MessageBubble } from "./MessageBubble";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chat.store";
import { useAuthStore } from "@/stores/auth.store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday, isYesterday } from "date-fns";
import { MessageSquare } from "lucide-react";

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
      dateLabel = "Today";
    } else if (isYesterday(date)) {
      dateLabel = "Yesterday";
    }

    if (!groupedMessages[dateLabel]) {
      groupedMessages[dateLabel] = [];
    }
    groupedMessages[dateLabel].push(msg);
  });

  return (
    <ScrollArea className="flex-1 h-full" style={{ background: "var(--nx-surface-0)" }}>
      <div className="p-6">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 animate-float"
              style={{
                background: "var(--nx-glass-bg)",
                border: "1px solid var(--nx-glass-border)",
              }}
            >
              <MessageSquare className="w-6 h-6" style={{ color: "var(--nx-accent-400)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--nx-text-secondary)" }}>
              No messages yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--nx-text-ghost)" }}>
              Start the conversation!
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="mb-6">
              {/* Date separator */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-px w-8" style={{ background: "var(--nx-glass-border)" }} />
                  <span
                    className="text-[11px] font-medium uppercase tracking-wider px-3 py-1 rounded-full"
                    style={{
                      color: "var(--nx-text-ghost)",
                      background: "var(--nx-surface-3)",
                      border: "1px solid var(--nx-glass-border)",
                    }}
                  >
                    {date}
                  </span>
                  <div className="h-px w-8" style={{ background: "var(--nx-glass-border)" }} />
                </div>
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
