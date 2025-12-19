import { Message, User } from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

interface ChatPanelProps {
  user: User;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
}

export function ChatPanel({
  user,
  messages,
  currentUserId,
  onSendMessage,
}: ChatPanelProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <ChatHeader user={user} />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        otherUser={user}
      />
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}
