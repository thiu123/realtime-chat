import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { MessageReactions } from "./MessageReactions";
import { LinkPreviewCard } from "./LinkPreviewCard";
import { ImageGrid } from "./ImageGrid";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
}

export function MessageBubble({ message, isSent }: MessageBubbleProps) {
  const isEmoji = message.type === "emoji";

  return (
    <div
      className={cn(
        "flex flex-col mb-4 animate-fade-in",
        isSent ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "max-w-md",
          !isEmoji && "px-4 py-2.5 rounded-2xl",
          isSent &&
            !isEmoji &&
            "bg-chat-sent text-primary-foreground rounded-br-sm",
          !isSent &&
            !isEmoji &&
            "bg-chat-received text-foreground rounded-bl-sm"
        )}
      >
        {message.type === "emoji" && (
          <span className="text-5xl">{message.content}</span>
        )}

        {message.type === "text" && (
          <p className="text-sm leading-relaxed">{message.content}</p>
        )}

        {message.type === "link" && (
          <>
            {message.content && (
              <p className="text-sm mb-1">{message.content}</p>
            )}
            {message.link && (
              <a
                href={message.link}
                className="text-link text-sm break-all hover:underline"
              >
                {message.link}
              </a>
            )}
            {message.linkPreview && (
              <LinkPreviewCard preview={message.linkPreview} />
            )}
          </>
        )}

        {message.type === "image" && message.images && (
          <ImageGrid images={message.images} caption={message.content} />
        )}
      </div>

      {message.reactions && <MessageReactions reactions={message.reactions} />}

      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs text-muted-foreground">
          {message.timestamp}
        </span>
        {isSent &&
          (message.read ? (
            <CheckCheck className="w-4 h-4 text-primary" />
          ) : (
            <Check className="w-4 h-4 text-muted-foreground" />
          ))}
      </div>
    </div>
  );
}
