import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  _hasHydrated: boolean;
}

interface AuthActions {
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  // Cập nhật avatar sau khi user upload ảnh mới
  updateAvatar: (avatarUrl: string) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      _hasHydrated: false,

      setAuth: (user, token) =>
        set({
          user,
          accessToken: token,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
        }),

      // Cập nhật avatar trong store (để UI cập nhật ngay lập tức)
      updateAvatar: (avatarUrl) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatar: avatarUrl } : null,
        })),

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
