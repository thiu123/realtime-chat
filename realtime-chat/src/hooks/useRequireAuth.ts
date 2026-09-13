"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/stores/auth.store";

/**
 * Chặn trang cần đăng nhập: chưa có user thì đá về /login.
 *
 * Phải đợi `_hasHydrated` vì Zustand đọc localStorage ở phía client, ngay lần
 * render đầu tiên `user` luôn là null dù thực ra đã đăng nhập rồi.
 */
export function useRequireAuth() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) router.replace("/login");
  }, [hasHydrated, user, router]);

  return { user, isReady: hasHydrated };
}

/**
 * Ngược lại với useRequireAuth: đã đăng nhập rồi thì không cần xem
 * trang login/signup nữa, chuyển thẳng vào màn hình chat.
 */
export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);
}
