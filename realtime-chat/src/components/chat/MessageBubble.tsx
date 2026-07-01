"use client";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { Check, CheckCheck, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

function isOnlyEmoji(text: string): boolean {
  const withoutEmoji = text.replace(
    /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu,
    ""
  ).trim();
  return withoutEmoji.length === 0 && text.trim().length > 0;
}

export function MessageBubble({ message, isMe, onEdit, onDelete }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || "");
  const [hovered, setHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  // Sync editContent when message.content changes (after save)
  useEffect(() => {
    if (!isEditing) {
      setEditContent(message.content || "");
    }
  }, [message.content, isEditing]);

  const handleStartEdit = () => {
    setEditContent(message.content || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit?.(message.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content || "");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const date = new Date(message.timestamp);
  const timeStr = !isNaN(date.getTime()) ? format(date, "HH:mm") : "00:00";

  const imageUrl = message.imageUrl || (message.images?.[0] ?? null);
  const emojiOnly = message.content ? isOnlyEmoji(message.content) : false;
  const hasImage = !!imageUrl;
  const canEdit = isMe && !hasImage && !!message.content;

  return (
    <div
      className={cn("flex flex-col mb-3 max-w-md animate-message-in", isMe && "items-end")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Action buttons — only for own messages, shown on hover */}
      {isMe && hovered && !isEditing && (
        <div className="flex items-center gap-1 mb-1.5 self-end">
          {canEdit && (
            <button
              onClick={handleStartEdit}
              className="p-1.5 rounded-lg transition-all duration-150"
              style={{
                background: "var(--nx-glass-bg)",
                border: "1px solid var(--nx-glass-border)",
                color: "var(--nx-text-tertiary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--nx-accent-400)";
                e.currentTarget.style.borderColor = "var(--nx-accent-500)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--nx-text-tertiary)";
                e.currentTarget.style.borderColor = "var(--nx-glass-border)";
              }}
              title="Edit message"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onDelete?.(message.id)}
            className="p-1.5 rounded-lg transition-all duration-150"
            style={{
              background: "var(--nx-glass-bg)",
              border: "1px solid var(--nx-glass-border)",
              color: "var(--nx-danger, #ef4444)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.12)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--nx-glass-bg)";
              e.currentTarget.style.borderColor = "var(--nx-glass-border)";
            }}
            title="Delete message"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isEditing ? (
        <div className="flex flex-col gap-2 w-full min-w-[220px]">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-4 py-2.5 text-sm rounded-2xl resize-none"
            style={{
              background: "var(--nx-surface-3)",
              border: "1px solid var(--nx-accent-500)",
              color: "white",
              outline: "none",
              minHeight: "60px",
              boxShadow: "0 0 0 2px rgba(99,102,241,0.2)",
            }}
            rows={2}
          />
          <div className="flex gap-2 self-end text-xs">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 rounded-lg transition-colors"
              style={{
                background: "var(--nx-surface-3)",
                border: "1px solid var(--nx-glass-border)",
                color: "var(--nx-text-tertiary)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!editContent.trim() || editContent.trim() === message.content}
              className="px-3 py-1 rounded-lg text-white transition-opacity"
              style={{
                background: "linear-gradient(135deg, var(--nx-accent-500), var(--nx-violet-500))",
                opacity: (!editContent.trim() || editContent.trim() === message.content) ? 0.4 : 1,
                cursor: (!editContent.trim() || editContent.trim() === message.content) ? "not-allowed" : "pointer",
              }}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "rounded-2xl",
            hasImage ? "bg-transparent p-0" : "py-2.5 px-4 text-sm",
            !hasImage && (isMe
              ? "msg-bubble-mine text-white rounded-br-md"
              : "msg-bubble-theirs text-white rounded-bl-md"),
            emojiOnly && !hasImage && "text-5xl px-1 py-0.5"
          )}
        >
          {imageUrl && (
            <div className="mb-2 rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt="Sent image"
                className="max-w-xs max-h-64 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(imageUrl, "_blank")}
              />
            </div>
          )}
          {message.content && (
            <p className="leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
        </div>
      )}

      {!isEditing && (
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[11px]" style={{ color: "var(--nx-text-ghost)" }}>{timeStr}</span>
          {isMe && (message.read
            ? <CheckCheck className="w-3 h-3" style={{ color: "var(--nx-accent-400)" }} />
            : <Check className="w-3 h-3" style={{ color: "var(--nx-text-ghost)" }} />
          )}
        </div>
      )}
    </div>
  );
}
