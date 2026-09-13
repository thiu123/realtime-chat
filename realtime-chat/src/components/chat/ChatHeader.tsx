import { MoreVertical, Phone, Search, Video } from "lucide-react";

import { ChatAvatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/chat";

interface ChatHeaderProps {
  /** Người đang chat cùng. */
  user: User;
}

/** Các nút gọi điện / gọi video / tìm kiếm mới chỉ là giao diện, chưa có chức năng. */
const PLACEHOLDER_ACTIONS = [
  { icon: Phone, label: "Voice call" },
  { icon: Video, label: "Video call" },
  { icon: Search, label: "Search in conversation" },
  { icon: MoreVertical, label: "More options" },
];

/** Thanh trên cùng của khung chat: tên + trạng thái online của người kia. */
export function ChatHeader({ user }: ChatHeaderProps) {
  const statusColor = user.online
    ? "var(--nx-online)"
    : "var(--nx-text-tertiary)";

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
          <h2 className="font-semibold text-white text-sm">{user.name}</h2>
          <p
            className="text-xs flex items-center gap-1.5"
            style={{ color: statusColor }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: user.online
                  ? "var(--nx-online)"
                  : "var(--nx-text-ghost)",
              }}
            />
            {user.online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {PLACEHOLDER_ACTIONS.map(({ icon: Icon, label }) => (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            title={`${label} (coming soon)`}
            disabled
            className="rounded-lg h-9 w-9"
            style={{ color: "var(--nx-text-tertiary)" }}
          >
            <Icon className="w-[18px] h-[18px]" />
          </Button>
        ))}
      </div>
    </div>
  );
}
