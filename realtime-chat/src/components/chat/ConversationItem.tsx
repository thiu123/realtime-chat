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
        "flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 relative mb-0.5",
        isActive ? "glow-bar-left" : "",
      )}
      style={{
        background: isActive
          ? "var(--nx-glass-bg-active)"
          : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "var(--nx-glass-bg-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <ChatAvatar src={user?.avatar} alt={user?.name} online={user?.online} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={cn(
              "font-medium truncate text-sm",
            )}
            style={{ color: isActive ? "white" : "var(--nx-text-primary)" }}
          >
            {user?.name}
          </h3>
          <span className="text-xs shrink-0 ml-2" style={{ color: "var(--nx-text-ghost)" }}>
            {timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p
            className="text-sm truncate"
            style={{
              color: unreadCount && unreadCount > 0
                ? "var(--nx-text-primary)"
                : "var(--nx-text-tertiary)",
              fontWeight: unreadCount && unreadCount > 0 ? 500 : 400,
            }}
          >
            {lastMessage}
          </p>
          {unreadCount && unreadCount > 0 && (
            <Badge
              className="text-white text-xs px-2 py-0.5 rounded-full ml-2 border-0"
              style={{
                background: "linear-gradient(135deg, var(--nx-accent-500), var(--nx-violet-500))",
                fontSize: "10px",
              }}
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
