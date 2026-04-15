"use client";

import {
  User,
  Bell,
  BellOff,
  Search,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User as UserType } from "@/types/chat";

interface UserDetailPanelProps {
  user: UserType;
}

const sharedFiles = [
  {
    id: 1,
    name: "Design_Guidelines_v2.pdf",
    size: "2.9 MB",
    date: "Oct 22",
    type: "pdf",
    icon: FileText,
    color: "var(--nx-danger)",
    bgColor: "rgba(239, 68, 68, 0.1)",
  },
  {
    id: 2,
    name: "Hero_Concept_Draft.png",
    size: "4.8 MB",
    date: "Oct 19",
    type: "image",
    icon: ImageIcon,
    color: "var(--nx-warning)",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
];

export function UserDetailPanel({ user }: UserDetailPanelProps) {
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        background: "var(--nx-surface-2)",
        borderLeft: "1px solid var(--nx-glass-border)",
      }}
    >
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Profile Card */}
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar
              className="w-24 h-24 mb-4 ring-4"
              style={{
                ["--tw-ring-color" as string]: "var(--nx-surface-3)",
                boxShadow: "0 0 24px rgba(99, 102, 241, 0.15)",
              }}
            >
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback
                className="text-white text-2xl font-semibold"
                style={{ background: "linear-gradient(135deg, var(--nx-accent-600), var(--nx-violet-600))" }}
              >
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-lg font-semibold text-white mb-1 tracking-tight">
              {user.name}
            </h2>
            <p className="text-sm mb-5" style={{ color: "var(--nx-text-tertiary)" }}>
              Senior Product Designer
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 text-white rounded-xl h-9 text-sm border-0 cursor-pointer transition-all duration-200"
                style={{
                  background: "var(--nx-surface-3)",
                  border: "1px solid var(--nx-glass-border)",
                }}
              >
                <User className="w-4 h-4 mr-1.5" />
                Profile
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-white rounded-xl h-9 text-sm border-0 cursor-pointer transition-all duration-200"
                style={{
                  background: "var(--nx-surface-3)",
                  border: "1px solid var(--nx-glass-border)",
                }}
              >
                <BellOff className="w-4 h-4 mr-1.5" />
                Mute
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-white rounded-xl h-9 w-9 border-0 cursor-pointer transition-all duration-200"
                style={{
                  background: "var(--nx-surface-3)",
                  border: "1px solid var(--nx-glass-border)",
                }}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator style={{ background: "var(--nx-glass-border)" }} className="mb-6" />

          {/* About Section */}
          <div className="mb-6">
            <h3
              className="text-[11px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--nx-accent-400)" }}
            >
              About
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--nx-text-secondary)" }}>
              Focusing on building scalable design systems and improving user
              experiences across our core dashboard products.
            </p>
          </div>

          <Separator style={{ background: "var(--nx-glass-border)" }} className="mb-6" />

          {/* Shared Files */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--nx-accent-400)" }}
              >
                Shared Files
              </h3>
              <button
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--nx-accent-400)" }}
              >
                See all
              </button>
            </div>

            <div className="space-y-2">
              {sharedFiles.map((file) => {
                const Icon = file.icon;
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer"
                    style={{ background: "var(--nx-glass-bg)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--nx-glass-bg-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--nx-glass-bg)";
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: file.bgColor, color: file.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--nx-text-ghost)" }}>
                        {file.size} • {file.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
