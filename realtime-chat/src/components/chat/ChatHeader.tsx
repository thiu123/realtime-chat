import { User } from "@/types/chat";
import { ChatAvatar } from "./Avatar";

interface ChatHeaderProps {
  user: User;
}

export function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <div className="h-16 px-4 flex items-center gap-3 border-b border-border bg-card">
      <ChatAvatar
        src={user.avatar}
        alt={user.name}
        size="sm"
        online={user.online}
      />
      <div>
        <h2 className="font-semibold text-foreground">{user?.name}</h2>
        <p className="text-sm text-muted-foreground">
          {user.online
            ? `Online for ${user.lastSeen}`
            : `Last seen ${user.lastSeen}`}
        </p>
      </div>
    </div>
  );
}
