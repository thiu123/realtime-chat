import { cn } from "@/lib/utils";
import { Conversation } from "@/types/chat";
import { ChatAvatar } from "./Avatar";
import { BellOff, Check, CheckCheck } from "lucide-react";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const { user, lastMessage, timestamp, unreadCount, muted } = conversation;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-colors",
        isActive ? "bg-accent" : "hover:bg-secondary"
      )}
    >
      <ChatAvatar src={user.avatar} alt={user.name} online={user.online} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground truncate">{user.name}</h3>
          <span className="text-xs text-muted-foreground flex-shrink-0">{timestamp}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {muted && <BellOff className="w-3.5 h-3.5 text-muted-foreground" />}
            {unreadCount ? (
              <span className="bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            ) : (
              <CheckCheck className="w-4 h-4 text-primary" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
