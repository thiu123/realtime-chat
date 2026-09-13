"use client";

import { format, isToday, isYesterday } from "date-fns";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef } from "react";

import { EmptyState } from "./EmptyState";
import { MessageBubble } from "./MessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/auth.store";
import { useChatStore } from "@/stores/chat.store";
import type { Message } from "@/types/chat";

interface MessageListProps {
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

/** Nhãn ngày ngăn cách giữa các nhóm tin nhắn: "Today" / "Yesterday" / "Oct 22, 2026". */
function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return format(date, "MMM dd, yyyy");
}

/** Gom tin nhắn theo ngày, giữ nguyên thứ tự cũ -> mới. */
function groupMessagesByDate(messages: Message[]): [string, Message[]][] {
  const groups = new Map<string, Message[]>();

  for (const message of messages) {
    const date = new Date(message.timestamp);
    if (isNaN(date.getTime())) continue; // bỏ qua tin nhắn có ngày hỏng

    const label = getDateLabel(date);
    const group = groups.get(label) ?? [];
    group.push(message);
    groups.set(label, group);
  }

  return [...groups.entries()];
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      <div className="h-px w-8" style={{ background: "var(--nx-glass-border)" }} />
      <span
        className="text-[11px] font-medium uppercase tracking-wider px-3 py-1 rounded-full"
        style={{
          color: "var(--nx-text-ghost)",
          background: "var(--nx-surface-3)",
          border: "1px solid var(--nx-glass-border)",
        }}
      >
        {label}
      </span>
      <div className="h-px w-8" style={{ background: "var(--nx-glass-border)" }} />
    </div>
  );
}

export function MessageList({ onEdit, onDelete }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = useChatStore((state) => state.messages);
  const currentUserId = useAuthStore((state) => state.user?.id);

  // Có tin nhắn mới thì cuộn xuống cuối.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentUserId) return null;

  const messageGroups = groupMessagesByDate(messages);

  return (
    <ScrollArea
      className="flex-1 h-full"
      style={{ background: "var(--nx-surface-0)" }}
    >
      <div className="p-6">
        {messageGroups.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Start the conversation!"
          />
        ) : (
          messageGroups.map(([label, group]) => (
            <div key={label} className="mb-6">
              <DateSeparator label={label} />

              {group.map((message) => {
                const isMine = message.senderId === currentUserId;

                return (
                  <div
                    key={message.id}
                    className={`flex mb-4 ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <MessageBubble
                      message={message}
                      isMine={isMine}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                );
              })}
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
