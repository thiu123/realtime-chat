"use client";

import { SharedFilesSection } from "./SharedFilesSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { User } from "@/types/chat";

interface UserDetailPanelProps {
  user: User;
}

/** Cột phải: thông tin của người đang chat cùng. */
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
                style={{
                  background:
                    "linear-gradient(135deg, var(--nx-accent-600), var(--nx-violet-600))",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-lg font-semibold text-white mb-1 tracking-tight">
              {user.name}
            </h2>

            <p
              className="text-sm"
              style={{
                color: user.online
                  ? "var(--nx-online)"
                  : "var(--nx-text-tertiary)",
              }}
            >
              {user.online ? "Online" : "Offline"}
            </p>
          </div>

          <Separator
            style={{ background: "var(--nx-glass-border)" }}
            className="mb-6"
          />

          <SharedFilesSection />
        </div>
      </ScrollArea>
    </div>
  );
}
