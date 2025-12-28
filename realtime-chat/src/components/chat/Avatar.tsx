import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
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
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className
        )}
      />
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
            online ? "bg-online" : "bg-muted-foreground"
          )}
        />
      )}
    </div>
  );
}
