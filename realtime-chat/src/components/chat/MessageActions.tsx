"use client";

import { Pencil, Trash2 } from "lucide-react";

interface MessageActionsProps {
  /** Tin nhắn ảnh thì không sửa được nội dung chữ. */
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/** Hai nút sửa / xoá hiện lên khi rê chuột vào tin nhắn của chính mình. */
export function MessageActions({
  canEdit,
  onEdit,
  onDelete,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-1 mb-1.5 self-end">
      {canEdit && (
        <button
          onClick={onEdit}
          title="Edit message"
          className="p-1.5 rounded-lg transition-all duration-150 cursor-pointer hover:text-[var(--nx-accent-400)]"
          style={{
            background: "var(--nx-glass-bg)",
            border: "1px solid var(--nx-glass-border)",
            color: "var(--nx-text-tertiary)",
          }}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        onClick={onDelete}
        title="Delete message"
        className="p-1.5 rounded-lg transition-all duration-150 cursor-pointer hover:bg-red-500/10"
        style={{
          background: "var(--nx-glass-bg)",
          border: "1px solid var(--nx-glass-border)",
          color: "var(--nx-danger)",
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
