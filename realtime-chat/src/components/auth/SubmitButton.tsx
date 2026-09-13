import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isLoading: boolean;
  /** Chữ hiện lúc đang gửi request, ví dụ "Signing in...". */
  loadingLabel: string;
  children: ReactNode;
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/** Nút submit chính của form, tự đổi sang trạng thái đang xử lý. */
export function SubmitButton({
  isLoading,
  loadingLabel,
  children,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      className="w-full h-12 text-white font-medium text-base rounded-xl border-0 cursor-pointer transition-all duration-300 accent-gradient hover:opacity-90"
      style={{
        boxShadow: isLoading ? "none" : "0 0 20px rgba(99, 102, 241, 0.25)",
      }}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner />
          {loadingLabel}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
