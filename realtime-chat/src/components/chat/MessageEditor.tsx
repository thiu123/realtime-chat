"use client";

import { useEffect, useRef, useState } from "react";

interface MessageEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

/**
 * Ô sửa tin nhắn tại chỗ.
 * Enter = lưu, Shift+Enter = xuống dòng, Esc = huỷ.
 */
export function MessageEditor({
  initialContent,
  onSave,
  onCancel,
}: MessageEditorProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự focus và đưa con trỏ về cuối khi vừa mở ô sửa.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, []);

  const trimmed = content.trim();
  const canSave = trimmed.length > 0 && trimmed !== initialContent;

  const handleSave = () => {
    if (canSave) onSave(trimmed);
    else onCancel();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSave();
    }

    if (event.key === "Escape") onCancel();
  };

  return (
    <div className="flex flex-col gap-2 w-full min-w-[220px]">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        className="px-4 py-2.5 text-sm rounded-2xl resize-none text-white outline-none min-h-[60px]"
        style={{
          background: "var(--nx-surface-3)",
          border: "1px solid var(--nx-accent-500)",
          boxShadow: "0 0 0 2px rgba(99,102,241,0.2)",
        }}
      />

      <div className="flex gap-2 self-end text-xs">
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded-lg transition-colors cursor-pointer"
          style={{
            background: "var(--nx-surface-3)",
            border: "1px solid var(--nx-glass-border)",
            color: "var(--nx-text-tertiary)",
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-3 py-1 rounded-lg text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, var(--nx-accent-500), var(--nx-violet-500))",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
