import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Khối "chưa có gì ở đây" dùng chung cho: chưa chọn cuộc trò chuyện,
 * chưa có tin nhắn, và tìm không ra cuộc trò chuyện nào.
 */
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center animate-fade-in">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
        style={{
          background: "var(--nx-glass-bg)",
          border: "1px solid var(--nx-glass-border)",
        }}
      >
        <Icon className="w-6 h-6" style={{ color: "var(--nx-accent-400)" }} />
      </div>

      <div>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--nx-text-secondary)" }}
        >
          {title}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--nx-text-ghost)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}
