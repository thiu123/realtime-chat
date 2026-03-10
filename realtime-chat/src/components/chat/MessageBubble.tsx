import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

// Kiểm tra xem 1 string có chỉ gồm emoji không
// VD: "😀😁" → true, "hello 😀" → false
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

  // Lấy ảnh từ imageUrl (kiểu mới) hoặc images[0] (kiểu cũ)
  const imageUrl = message.imageUrl || (message.images?.[0] ?? null);

  // Nếu chỉ có emoji → hiển thị to hơn, không cần nền
  const emojiOnly = message.content ? isOnlyEmoji(message.content) : false;

  return (
    <div className={cn("flex flex-col mb-3 max-w-md", isMe && "items-end")}>
      <div
        className={cn(
          // Nếu chỉ có emoji thì không cần background
          emojiOnly && !imageUrl
            ? "text-5xl px-1 py-0.5"
            : cn(
                "py-2.5 rounded-2xl text-sm",
                isMe
                  ? "text-white rounded-br-md"
                  : "text-white rounded-bl-md"
              )
        )}
      >
        {/* Hiển thị ảnh (nếu là tin nhắn hình ảnh) */}
        {imageUrl && (
          <div className="mb-2 rounded-xl overflow-hidden">
            <img
              src={imageUrl}
              alt="Sent image"
              className="max-w-xs max-h-64 rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity"
              // Click để xem ảnh to hơn trong tab mới
              onClick={() => window.open(imageUrl, "_blank")}
            />
          </div>
        )}

        {/* Hiển thị nội dung text / emoji */}
        {message.content && (
          <p className="leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
      </div>

      {/* Thời gian gửi + trạng thái đã đọc */}
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
