import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const date = new Date(message.timestamp);
  const timeStr = !isNaN(date.getTime()) ? format(date, "HH:mm") : "00:00";

  return (
    <div className={cn("flex flex-col mb-3 max-w-md", isMe && "items-end")}>
      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl text-sm",
          isMe
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-zinc-800 text-white rounded-bl-md",
        )}
      >
        {message.images && message.images.length > 0 && message.images[0] && (
          <div className="mb-2 rounded-lg overflow-hidden">
            <img
              src={message.images[0]}
              alt="Shared image"
              className="max-w-xs rounded-lg"
            />
          </div>
        )}

        {message.content && (
          <p className="leading-relaxed whitespace-pre-wrap wrap-break-word">
            {message.content}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-xs text-zinc-500">{timeStr}</span>
        {isMe &&
          (message.read ? (
            <CheckCheck className="w-3 h-3 text-blue-500" />
          ) : (
            <Check className="w-3 h-3 text-zinc-500" />
          ))}
      </div>
    </div>
  );
}
