"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

import { TextField } from "./TextField";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  minLength?: number;
  labelAction?: ReactNode;
}

/** Ô nhập mật khẩu, kèm nút con mắt để xem mật khẩu vừa gõ. */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  minLength,
  labelAction,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      id={id}
      label={label}
      icon={Lock}
      labelAction={labelAction}
      type={isVisible ? "text" : "password"}
      placeholder="••••••••"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      minLength={minLength}
      required
      trailing={
        <button
          type="button"
          onClick={() => setIsVisible((previous) => !previous)}
          title={isVisible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
          style={{ color: "var(--nx-text-ghost)" }}
        >
          {isVisible ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      }
    />
  );
}
