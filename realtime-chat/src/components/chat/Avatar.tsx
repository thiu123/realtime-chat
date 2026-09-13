import { cn } from "@/lib/utils";

interface ChatAvatarProps {
  /** Ảnh base64 hoặc URL. Không có thì hiện chữ cái đầu của tên. */
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  /** Bỏ trống thì không vẽ chấm trạng thái. */
  online?: boolean;
}

const SIZE_CLASSES = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-14 h-14",
};

/**
 * Ảnh đại diện kèm chấm xanh/xám báo online.
 *
 * Khác với `components/ui/avatar` (của shadcn, dựa trên Radix), component này
 * đơn giản hơn và có sẵn chấm trạng thái nên dùng cho danh sách chat.
 */
export function ChatAvatar({
  src,
  alt,
  size = "md",
  online,
}: ChatAvatarProps) {
  return (
    <div className="relative shrink-0">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh là chuỗi base64 nên next/image không tối ưu được
        <img
          src={src}
          alt={alt}
          className={cn("rounded-full object-cover", SIZE_CLASSES[size])}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center text-white font-medium",
            SIZE_CLASSES[size],
          )}
          style={{
            background:
              "linear-gradient(135deg, var(--nx-accent-600), var(--nx-violet-600))",
          }}
        >
          {alt.charAt(0).toUpperCase()}
        </div>
      )}

      {online !== undefined && (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
          style={{
            background: online ? "var(--nx-online)" : "var(--nx-text-ghost)",
            borderColor: "var(--nx-surface-2)",
            boxShadow: online ? "0 0 6px rgba(52, 211, 153, 0.4)" : "none",
          }}
        />
      )}
    </div>
  );
}
