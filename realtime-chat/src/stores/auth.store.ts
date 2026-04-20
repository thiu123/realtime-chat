import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const ACCESS_TOKEN_KEY = "access_token";

const setAccessTokenStorage = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

const clearAccessTokenStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

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
  updateAvatar: (avatarUrl: string) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      _hasHydrated: false,

      setAuth: (user, token) => {
        setAccessTokenStorage(token);
        set({
          user,
          accessToken: token,
        });
      },

      clearAuth: () => {
        clearAccessTokenStorage();
        set({
          user: null,
          accessToken: null,
        });
      },

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
        if (state?.accessToken) {
          setAccessTokenStorage(state.accessToken);
        } else {
          clearAccessTokenStorage();
        }

        state?.setHasHydrated(true);
      },
    }
  )
);
