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
  // Trạng thái khi đang upload ảnh (để hiện loading)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);

  // Ref tới input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  // ======================================================
  // Xử lý khi user chọn ảnh avatar mới
  // ======================================================
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Giới hạn kích thước avatar (500KB là đủ)
    if (file.size > 500 * 1024) {
      alert("Avatar image is too large! Please select an image under 500KB.");
      return;
    }

    setIsUploadingAvatar(true); // Bật loading

    try {
      // Bước 1: Đọc file ảnh và chuyển sang base64 bằng FileReader
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        try {
          // Bước 2: Gọi API backend để lưu avatar vào database
          await updateUserAvatar(user.id, base64);

          // Bước 3: Cập nhật avatar trong auth store → UI cập nhật ngay
          updateAvatar(base64);

          console.log("✅ Avatar updated!");
        } catch (error) {
          console.error("❌ Lỗi khi cập nhật avatar:", error);
          alert("Cannot update avatar. Please try again!");
        } finally {
          setIsUploadingAvatar(false); // Tắt loading
        }
      };
      reader.readAsDataURL(file); // Bắt đầu đọc file
    } catch {
      setIsUploadingAvatar(false);
    }

    // Reset để có thể chọn lại cùng file
    e.target.value = "";
  };

  return (
    <div className="w-full bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-4">
      <div className="mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2 w-full items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-xl transition-all relative group",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800",
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>

      {/* Avatar ở dưới cùng — click để đổi ảnh */}
      <div className="mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              {/* Bọc avatar trong div relative để đặt icon camera lên trên */}
              <div className="relative group">
                <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-zinc-800 hover:ring-blue-600 transition-all">
                  <AvatarImage src={user?.avatar || currentUser?.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                    {user?.name?.charAt(0) || currentUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Overlay camera icon khi hover — gợi ý có thể đổi avatar */}
                {isUploadingAvatar ? (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="right" className="w-56 bg-zinc-900 border-zinc-800">
            <DropdownMenuLabel className="text-zinc-300">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-zinc-500">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />

            {/* Nút đổi avatar — trigger click vào input file ẩn */}
            <DropdownMenuItem
              className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mr-2 h-4 w-4" />
              <span>Change avatar</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
              onClick={() => setActiveItem("profile")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
              onClick={() => setActiveItem("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              className="text-red-400 focus:bg-red-950 focus:text-red-300 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Input file ẩn — chỉ nhận ảnh, giới hạn 500KB */}
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
