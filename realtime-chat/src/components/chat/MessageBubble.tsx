"use client";

import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { useState } from "react";

import { MessageActions } from "./MessageActions";
import { MessageEditor } from "./MessageEditor";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  /** true nếu tin nhắn do chính mình gửi (bong bóng nằm bên phải). */
  isMine: boolean;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

/** Tin nhắn chỉ toàn emoji thì hiển thị to hơn, không cần nền bong bóng. */
function isOnlyEmoji(text: string): boolean {
  const withoutEmoji = text
    .replace(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu, "")
    .trim();

  return withoutEmoji.length === 0 && text.trim().length > 0;
}

function formatSentTime(timestamp: string): string {
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? "--:--" : format(date, "HH:mm");
}

export function MessageBubble({
  message,
  isMine,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasImage = Boolean(message.imageUrl);
  const emojiOnly = message.content ? isOnlyEmoji(message.content) : false;
  const canEdit = isMine && !hasImage && Boolean(message.content);

  return (
    <div
      className={cn(
        "flex flex-col mb-3 max-w-md animate-message-in",
        isMine && "items-end",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isMine && isHovered && !isEditing && (
        <MessageActions
          canEdit={canEdit}
          onEdit={() => setIsEditing(true)}
          onDelete={() => onDelete(message.id)}
        />
      )}

      {isEditing ? (
        <MessageEditor
          initialContent={message.content ?? ""}
          onCancel={() => setIsEditing(false)}
          onSave={(content) => {
            onEdit(message.id, content);
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          <div
            className={cn(
              "rounded-2xl",
              hasImage ? "bg-transparent p-0" : "py-2.5 px-4 text-sm",
              !hasImage &&
                (isMine
                  ? "msg-bubble-mine text-white rounded-br-md"
                  : "msg-bubble-theirs text-white rounded-bl-md"),
              emojiOnly && !hasImage && "text-5xl px-1 py-0.5",
            )}
          >
            {message.imageUrl && (
              <div className="mb-2 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh là chuỗi base64 nên next/image không tối ưu được */}
                <img
                  src={message.imageUrl}
                  alt="Sent image"
                  className="max-w-xs max-h-64 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.imageUrl, "_blank")}
                />
              </div>
            )}

            {message.content && (
              <p className="leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1 px-1">
            <span
              className="text-[11px]"
              style={{ color: "var(--nx-text-ghost)" }}
            >
              {formatSentTime(message.timestamp)}
            </span>

            {/* Một tích = đã gửi, hai tích = người kia đã đọc. */}
            {isMine &&
              (message.read ? (
                <CheckCheck
                  className="w-3 h-3"
                  style={{ color: "var(--nx-accent-400)" }}
                />
              ) : (
                <Check
                  className="w-3 h-3"
                  style={{ color: "var(--nx-text-ghost)" }}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}
