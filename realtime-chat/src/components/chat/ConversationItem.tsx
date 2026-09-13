import { ChatAvatar } from "./Avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

/** Một dòng trong danh sách chat: avatar, tên, tin nhắn cuối, số tin chưa đọc. */
export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const { user, lastMessage, timestamp, unreadCount } = conversation;
  const hasUnread = (unreadCount ?? 0) > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 w-full text-left cursor-pointer rounded-xl transition-all duration-200 relative mb-0.5",
        isActive ? "glow-bar-left" : "hover:bg-white/5",
      )}
      style={{
        background: isActive ? "var(--nx-glass-bg-active)" : "transparent",
      }}
    >
      <ChatAvatar src={user.avatar} alt={user.name} online={user.online} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3
            className="font-medium truncate text-sm"
            style={{ color: isActive ? "white" : "var(--nx-text-primary)" }}
          >
            {user.name}
          </h3>
          <span
            className="text-xs shrink-0 ml-2"
            style={{ color: "var(--nx-text-ghost)" }}
          >
            {timestamp}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p
            className="text-sm truncate"
            style={{
              color: hasUnread
                ? "var(--nx-text-primary)"
                : "var(--nx-text-tertiary)",
              fontWeight: hasUnread ? 500 : 400,
            }}
          >
            {lastMessage}
          </p>

          {hasUnread && (
            <Badge
              className="text-white text-[10px] px-2 py-0.5 rounded-full ml-2 border-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--nx-accent-500), var(--nx-violet-500))",
              }}
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
