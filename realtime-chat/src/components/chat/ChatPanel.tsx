import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChatStore } from "@/stores/chat.store";

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ onSendMessage }: ChatPanelProps) {
  const activeConversation = useChatStore((state) =>
    state.activeConversation(),
  );

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center bg-zinc-950 text-zinc-500">
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950">
      <ChatHeader user={activeConversation.user} />
      <MessageList />
      <MessageInput
        onSend={onSendMessage}
        isTyping={false}
        typingUser="Sarah"
      />
    </div>
  );
}
