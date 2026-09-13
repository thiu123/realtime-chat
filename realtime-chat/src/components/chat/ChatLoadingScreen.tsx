import { MessageSquare } from "lucide-react";

/** Ba chấm nhảy nhấp nhô lúc chờ tải dữ liệu. */
function BouncingDots() {
  return (
    <div className="flex items-center gap-2">
      {[0, 150, 300].map((delay) => (
        <div
          key={delay}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{
            background: "var(--nx-accent-400)",
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

/** Màn hình chờ khi đang tải danh sách cuộc trò chuyện lần đầu. */
export function ChatLoadingScreen() {
  return (
    <div
      className="flex h-screen items-center justify-center noise-bg"
      style={{ background: "var(--nx-surface-0)" }}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center accent-gradient animate-glow-pulse">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>

        <BouncingDots />

        <p
          className="text-sm font-medium"
          style={{ color: "var(--nx-text-tertiary)" }}
        >
          Loading your conversations...
        </p>
      </div>
    </div>
  );
}
