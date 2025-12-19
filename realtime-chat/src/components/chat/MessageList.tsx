import { Message, User } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { ChatAvatar } from "./Avatar";

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
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
      {messages.map((message) => {
        const isSent = message.senderId === currentUserId;

        return (
          <div key={message.id} className="flex gap-2">
            {!isSent && (
              <div className="flex flex-col justify-end">
                <ChatAvatar
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  size="sm"
                />
              </div>
            )}
            <div className={`flex-1 ${isSent ? "flex justify-end" : ""}`}>
              <MessageBubble message={message} isSent={isSent} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
