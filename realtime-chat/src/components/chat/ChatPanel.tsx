import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChatStore } from "@/stores/chat.store";
import { MessageSquare } from "lucide-react";

interface ChatPanelProps {
  onSendMessage: (message: string, type?: string, imageUrl?: string) => void;
  isTyping?: boolean;
  typingUser?: string;
  onTypingChange?: (isTyping: boolean) => void;
}

export function ChatPanel({ onSendMessage, isTyping, typingUser, onTypingChange }: ChatPanelProps) {
  const activeConversation = useChatStore((state) =>
    state.activeConversation(),
  );

  if (!activeConversation) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ background: "var(--nx-surface-0)" }}
      >
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center animate-float"
            style={{
              background: "var(--nx-glass-bg)",
              border: "1px solid var(--nx-glass-border)",
            }}
          >
            <MessageSquare className="w-7 h-7" style={{ color: "var(--nx-accent-400)" }} />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm" style={{ color: "var(--nx-text-secondary)" }}>
              Select a conversation
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--nx-text-ghost)" }}>
              Choose a chat to start messaging
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full" style={{ background: "var(--nx-surface-0)" }}>
      <ChatHeader user={activeConversation.user} />
      <MessageList />
      <MessageInput
        onSend={onSendMessage}
        isTyping={isTyping}
        typingUser={typingUser}
        onTypingChange={onTypingChange}
      />
    </div>
  );
}
