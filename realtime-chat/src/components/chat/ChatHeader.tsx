import { User } from "@/types/chat";
import { ChatAvatar } from "./Avatar";
import { Phone, Video, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  user: User;
}

export function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <div
      className="h-16 w-full px-6 flex items-center justify-between"
      style={{
        background: "var(--nx-surface-2)",
        borderBottom: "1px solid var(--nx-glass-border)",
      }}
    >
      <div className="flex items-center gap-3">
        <ChatAvatar
          src={user.avatar}
          alt={user.name}
          size="sm"
          online={user.online}
        />
        <div>
          <h2 className="font-semibold text-white text-sm">{user?.name}</h2>
          <p
            className="text-xs flex items-center gap-1.5"
            style={{ color: user.online ? "var(--nx-online)" : "var(--nx-text-tertiary)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: user.online ? "var(--nx-online)" : "var(--nx-text-ghost)" }}
            />
            {user.online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {[Phone, Video, Search, MoreVertical].map((Icon, i) => (
          <Button
            key={i}
            variant="ghost"
            size="icon"
            className="rounded-lg transition-all duration-200 h-9 w-9"
            style={{ color: "var(--nx-text-tertiary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "white";
              e.currentTarget.style.background = "var(--nx-glass-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--nx-text-tertiary)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Icon className="w-[18px] h-[18px]" />
          </Button>
        ))}
      </div>
    </div>
  );
}
