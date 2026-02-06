"use client";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Phone,
  Settings,
  LogOut,
  User,
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
import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="w-full bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-4">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Navigation Icons */}
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

      {/* User Profile Dropdown */}
      <div className="mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-zinc-800 hover:ring-blue-600 transition-all">
                <AvatarImage
                  src={user?.avatar || currentUser?.avatar || undefined}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                  {user?.name?.charAt(0) || currentUser?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="right"
            className="w-56 bg-zinc-900 border-zinc-800"
          >
            <DropdownMenuLabel className="text-zinc-300">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-zinc-500">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
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
      </div>
    </div>
  );
}
