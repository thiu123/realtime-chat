import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "id"> {
  id: string;
  label: string;
  /** Icon hiện bên trái ô nhập. */
  icon: LucideIcon;
  /** Nội dung phụ bên phải nhãn, ví dụ link "Forgot password?". */
  labelAction?: ReactNode;
  /** Nút phụ nằm bên trong ô nhập, ví dụ nút hiện/ẩn mật khẩu. */
  trailing?: ReactNode;
}

/**
 * Một ô nhập liệu của form đăng nhập / đăng ký: nhãn + icon + input.
 * Gom lại vì cả 6 ô ở 2 trang đều có kiểu dáng giống hệt nhau.
 */
export function TextField({
  id,
  label,
  icon: Icon,
  labelAction,
  trailing,
  className,
  ...inputProps
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-sm"
          style={{ color: "var(--nx-text-secondary)" }}
        >
          {label}
        </Label>
        {labelAction}
      </div>

      <div className="relative">
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
          style={{ color: "var(--nx-text-ghost)" }}
        />

        <Input
          id={id}
          className={cn(
            "pl-11 h-12 rounded-xl text-white placeholder:text-zinc-600",
            trailing && "pr-11",
            className,
          )}
          style={{
            background: "var(--nx-surface-3)",
            borderColor: "var(--nx-glass-border)",
          }}
          {...inputProps}
        />

        {trailing}
      </div>
    </div>
  );
}
