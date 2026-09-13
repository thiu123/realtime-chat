"use client";

import { Camera, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useAuthStore } from "@/stores/auth.store";
import { useChatStore } from "@/stores/chat.store";

/**
 * Ảnh đại diện của mình ở góc trên sidebar, bấm vào ra menu:
 * đổi ảnh đại diện / đăng xuất.
 */
export function CurrentUserMenu() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const resetChat = useChatStore((state) => state.reset);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, uploadAvatar } = useAvatarUpload();

  const handleLogout = () => {
    clearAuth();
    // Xoá luôn dữ liệu chat, nếu không người đăng nhập sau sẽ thấy chat của người trước.
    resetChat();
    router.replace("/login");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) void uploadAvatar(file);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="focus:outline-none cursor-pointer">
            <div className="relative">
              <Avatar className="w-9 h-9 transition-all duration-300">
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback
                  className="text-white text-sm font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--nx-accent-600), var(--nx-violet-600))",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>

              {isUploading && (
                <div
                  className="absolute inset-0 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.6)" }}
                >
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="bottom"
          className="w-56 rounded-xl"
          style={{
            background: "var(--nx-surface-4)",
            borderColor: "var(--nx-glass-border)",
          }}
        >
          <DropdownMenuLabel style={{ color: "var(--nx-text-secondary)" }}>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-white">
                {user?.name}
              </p>
              <p
                className="text-xs leading-none"
                style={{ color: "var(--nx-text-ghost)" }}
              >
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator
            style={{ background: "var(--nx-glass-border)" }}
          />

          <DropdownMenuItem
            className="cursor-pointer rounded-lg focus:text-white"
            style={{ color: "var(--nx-text-secondary)" }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mr-2 h-4 w-4" />
            <span>Change avatar</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator
            style={{ background: "var(--nx-glass-border)" }}
          />

          <DropdownMenuItem
            className="cursor-pointer rounded-lg text-red-400 focus:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
