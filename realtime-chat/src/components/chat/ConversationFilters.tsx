"use client";

/** Các bộ lọc danh sách chat. Backend chưa có chat nhóm nên chỉ có 2 lựa chọn. */
export const CONVERSATION_FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
] as const;

export type ConversationFilter = (typeof CONVERSATION_FILTERS)[number]["id"];

interface ConversationFiltersProps {
  value: ConversationFilter;
  onChange: (filter: ConversationFilter) => void;
  /** Số cuộc trò chuyện đang có tin chưa đọc, hiện cạnh nhãn "Unread". */
  unreadCount: number;
}

export function ConversationFilters({
  value,
  onChange,
  unreadCount,
}: ConversationFiltersProps) {
  return (
    <div className="flex items-center gap-1.5">
      {CONVERSATION_FILTERS.map((filter) => {
        const isActive = value === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer"
            style={{
              background: isActive
                ? "var(--nx-accent-600)"
                : "var(--nx-surface-3)",
              color: isActive ? "white" : "var(--nx-text-secondary)",
            }}
          >
            {filter.label}
            {filter.id === "unread" && unreadCount > 0 && ` (${unreadCount})`}
          </button>
        );
      })}
    </div>
  );
}
