"use client";

import { MessageSquare } from "lucide-react";

import { ChatHeader } from "./ChatHeader";
import { EmptyState } from "./EmptyState";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { useChatStore } from "@/stores/chat.store";
import type { MessageType } from "@/types/api";

interface ChatPanelProps {
  /** Tên người đang gõ, undefined nghĩa là không ai đang gõ. */
  typingUser?: string;
  onSendMessage: (
    content: string,
    type?: MessageType,
    imageUrl?: string,
  ) => void;
  onTypingChange: (isTyping: boolean) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

/** Cột giữa: tiêu đề + danh sách tin nhắn + ô nhập tin. */
export function ChatPanel({
  typingUser,
  onSendMessage,
  onTypingChange,
  onEditMessage,
  onDeleteMessage,
}: ChatPanelProps) {
  const activeConversation = useChatStore((state) =>
    state.activeConversation(),
  );

  if (!activeConversation) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ background: "var(--nx-surface-0)" }}
      >
        <EmptyState
          icon={MessageSquare}
          title="Select a conversation"
          description="Choose a chat to start messaging"
        />
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-full"
      style={{ background: "var(--nx-surface-0)" }}
    >
      <ChatHeader user={activeConversation.user} />

      <MessageList onEdit={onEditMessage} onDelete={onDeleteMessage} />

      <MessageInput
        typingUser={typingUser}
        onSend={onSendMessage}
        onTypingChange={onTypingChange}
      />
    </div>
  );
}
