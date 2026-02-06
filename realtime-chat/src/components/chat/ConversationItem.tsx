import { cn } from "@/lib/utils";
import { Conversation } from "@/types/chat";
import { ChatAvatar } from "./Avatar";
import { Badge } from "@/components/ui/badge";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const { user, lastMessage, timestamp, unreadCount } = conversation;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all relative mb-1",
        isActive
          ? "bg-zinc-800 border-l-4 border-blue-600"
          : "hover:bg-zinc-800/50",
      )}
    >
      <ChatAvatar src={user?.avatar} alt={user?.name} online={user?.online} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={cn(
              "font-medium truncate text-sm",
              isActive ? "text-white" : "text-zinc-200",
            )}
          >
            {user?.name}
          </h3>
          <span className="text-xs text-zinc-500 shrink-0 ml-2">
            {timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p
            className={cn(
              "text-sm truncate",
              unreadCount && unreadCount > 0
                ? "text-white font-medium"
                : "text-zinc-400",
            )}
          >
            {lastMessage}
          </p>
          {unreadCount && unreadCount > 0 && (
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-0.5 rounded-full ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
