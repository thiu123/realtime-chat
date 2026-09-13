import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TypingIndicatorProps {
  /** Tên người đang gõ. */
  userName: string;
}

/** Dòng "... is typing" hiện phía trên ô nhập tin. */
export function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <div
      className="flex items-center gap-2 mb-3 text-sm"
      style={{ color: "var(--nx-text-tertiary)" }}
    >
      <Avatar className="w-6 h-6">
        <AvatarFallback
          className="text-xs"
          style={{
            background: "var(--nx-surface-4)",
            color: "var(--nx-text-tertiary)",
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <span className="flex items-center gap-1">
        {["0s", "0.2s", "0.4s"].map((delay) => (
          <span
            key={delay}
            className="animate-bounce"
            style={{ color: "var(--nx-accent-400)", animationDelay: delay }}
          >
            ●
          </span>
        ))}
        <span className="ml-1">{userName} is typing...</span>
      </span>
    </div>
  );
}
