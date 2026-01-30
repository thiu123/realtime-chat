"use client";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Phone,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

      <div className="mt-4">
        <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-zinc-800 hover:ring-blue-600 transition-all">
          <AvatarImage src={currentUser?.avatar || undefined} />
          <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-white text-sm">
            {currentUser?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
