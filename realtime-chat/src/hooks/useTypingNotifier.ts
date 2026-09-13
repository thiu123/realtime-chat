"use client";

import { useEffect, useRef } from "react";

/** Ngừng gõ bao lâu thì coi như đã dừng (mili giây). */
const TYPING_IDLE_DELAY = 1200;

/**
 * Báo cho người kia biết mình đang gõ, nhưng không spam server:
 * - có chữ  -> báo "đang gõ"
 * - im 1.2s -> tự báo "ngừng gõ"
 *
 * @param onTypingChange hàm gửi trạng thái lên server
 */
export function useTypingNotifier(onTypingChange?: (isTyping: boolean) => void) {
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  /** Gọi mỗi lần nội dung ô nhập thay đổi. */
  const handleInputChange = (value: string) => {
    if (!value.trim()) {
      stopTyping();
      return;
    }

    onTypingChange?.(true);

    clearTimer();
    idleTimerRef.current = setTimeout(() => {
      onTypingChange?.(false);
      idleTimerRef.current = null;
    }, TYPING_IDLE_DELAY);
  };

  /** Gọi khi gửi xong tin nhắn hoặc khi ô nhập mất focus. */
  const stopTyping = () => {
    clearTimer();
    onTypingChange?.(false);
  };

  // Rời màn hình mà còn hẹn giờ thì phải huỷ, tránh setState trên component đã gỡ.
  useEffect(() => clearTimer, []);

  return { handleInputChange, stopTyping };
}
