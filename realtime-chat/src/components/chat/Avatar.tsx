import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-14 h-14",
};

export function ChatAvatar({
  src,
  alt,
  size = "md",
  online,
  className,
}: AvatarProps) {
  return (
    <div className="relative shrink-0">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "rounded-full object-cover",
            sizeClasses[size],
            className,
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center text-white font-medium",
            sizeClasses[size],
            className,
          )}
          style={{
            background: "linear-gradient(135deg, var(--nx-accent-600), var(--nx-violet-600))",
          }}
        >
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2",
          )}
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
