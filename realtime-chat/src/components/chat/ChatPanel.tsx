import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChatStore } from "@/stores/chat.store";

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ onSendMessage }: ChatPanelProps) {
  const activeConversation = useChatStore((state) =>
    state.activeConversation()
  );

  if (!activeConversation) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <ChatHeader user={activeConversation.user} />
      <MessageList />
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}
