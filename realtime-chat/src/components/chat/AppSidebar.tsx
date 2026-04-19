"use client";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Phone,
  Settings,
  LogOut,
  User,
  Camera,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { updateUserAvatar } from "@/services/chat.service";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: MessageSquare, label: "Messages", id: "messages" },
  { icon: Users, label: "Contacts", id: "contacts" },
  { icon: Phone, label: "Calls", id: "calls" },
  { icon: Settings, label: "Settings", id: "settings" },
];

interface AppSidebarProps {
  currentUser?: {
    name: string;
    avatar?: string;
  };
}

export function AppSidebar({ currentUser }: AppSidebarProps) {
  const [activeItem, setActiveItem] = useState("messages");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 500 * 1024) {
      alert("Avatar image is too large! Please select an image under 500KB.");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        try {
          await updateUserAvatar(user.id, base64);
          updateAvatar(base64);
          console.log("Avatar updated!");
        } catch (error) {
          console.error("Error updating avatar:", error);
          alert("Cannot update avatar. Please try again!");
        } finally {
          setIsUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingAvatar(false);
    }

    e.target.value = "";
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center py-4"
      style={{
        background: "var(--nx-surface-1)",
        borderRight: "1px solid var(--nx-glass-border)",
      }}
    >
      {/* Logo */}
      <div className="mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center accent-gradient"
          style={{ boxShadow: "0 0 16px rgba(99, 102, 241, 0.25)" }}
        >
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1.5 w-full items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={cn(
                "w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 relative group",
                isActive
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, var(--nx-accent-600), var(--nx-violet-600))"
                  : "transparent",
                color: isActive ? "white" : "var(--nx-text-tertiary)",
                boxShadow: isActive ? "0 0 16px rgba(99, 102, 241, 0.3)" : "none",
              }}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <span
                className="absolute left-full ml-3 px-2.5 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                style={{ background: "var(--nx-surface-4)", border: "1px solid var(--nx-glass-border)" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Avatar */}
      <div className="mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <div className="relative group">
                <Avatar
                  className="w-10 h-10 cursor-pointer ring-2 transition-all duration-300"
                  style={{
                    ["--tw-ring-color" as string]: "var(--nx-glass-border)",
                  }}
                >
                  <AvatarImage src={user?.avatar || currentUser?.avatar || undefined} />
                  <AvatarFallback
                    className="text-white text-sm font-medium"
                    style={{ background: "linear-gradient(135deg, var(--nx-accent-600), var(--nx-violet-600))" }}
                  >
                    {user?.name?.charAt(0) || currentUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                {isUploadingAvatar ? (
                  <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="right"
            className="w-56 rounded-xl"
            style={{
              background: "var(--nx-surface-4)",
              borderColor: "var(--nx-glass-border)",
            }}
          >
            <DropdownMenuLabel style={{ color: "var(--nx-text-secondary)" }}>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                <p className="text-xs leading-none" style={{ color: "var(--nx-text-ghost)" }}>
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: "var(--nx-glass-border)" }} />

            <DropdownMenuItem
              className="cursor-pointer rounded-lg focus:text-white"
              style={{ color: "var(--nx-text-secondary)" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mr-2 h-4 w-4" />
              <span>Change avatar</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer rounded-lg focus:text-white"
              style={{ color: "var(--nx-text-secondary)" }}
              onClick={() => setActiveItem("profile")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer rounded-lg focus:text-white"
              style={{ color: "var(--nx-text-secondary)" }}
              onClick={() => setActiveItem("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "var(--nx-glass-border)" }} />
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
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
