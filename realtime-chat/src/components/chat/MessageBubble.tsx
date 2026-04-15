import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

function isOnlyEmoji(text: string): boolean {
  const withoutEmoji = text.replace(
    /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu,
    ""
  ).trim();
  return withoutEmoji.length === 0 && text.trim().length > 0;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const date = new Date(message.timestamp);
  const timeStr = !isNaN(date.getTime()) ? format(date, "HH:mm") : "00:00";

  const imageUrl = message.imageUrl || (message.images?.[0] ?? null);
  const emojiOnly = message.content ? isOnlyEmoji(message.content) : false;
  const hasImage = !!imageUrl;

  return (
    <div className={cn("flex flex-col mb-3 max-w-md animate-message-in", isMe && "items-end")}>
      <div
        className={cn(
          "rounded-2xl",

          hasImage
            ? "bg-transparent p-0"
            : "py-2.5 px-4 text-sm",

          !hasImage &&
          (isMe
            ? "msg-bubble-mine text-white rounded-br-md"
            : "msg-bubble-theirs text-white rounded-bl-md"),

          emojiOnly && !hasImage && "text-5xl px-1 py-0.5"
        )}
      >
        {/* Image */}
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

        {/* Text / Emoji content */}
        {message.content && (
          <p className="leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
      </div>

      {/* Timestamp + Read status */}
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-[11px]" style={{ color: "var(--nx-text-ghost)" }}>{timeStr}</span>
        {isMe &&
          (message.read ? (
            <CheckCheck className="w-3 h-3" style={{ color: "var(--nx-accent-400)" }} />
          ) : (
            <Check className="w-3 h-3" style={{ color: "var(--nx-text-ghost)" }} />
          ))}
      </div>
    </div>
  );
}
