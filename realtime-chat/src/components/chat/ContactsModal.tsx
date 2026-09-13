"use client";

import { PenSquare, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/chat.store";

interface ContactsModalProps {
  /** Gọi khi chọn một người để bắt đầu trò chuyện. */
  onSelectUser: (userId: string) => void;
}

/** Nút bút chì ở sidebar: mở hộp thoại chọn người để nhắn tin. */
export function ContactsModal({ onSelectUser }: ContactsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const users = useChatStore((state) => state.users);

  // Mỗi lần mở lại thì xoá ô tìm kiếm cũ.
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) setKeyword("");
  };

  const filteredUsers = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized),
    );
  }, [users, keyword]);

  const handleSelect = (userId: string) => {
    onSelectUser(userId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          title="New message"
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
          style={{
            background: "var(--nx-surface-3)",
            color: "var(--nx-text-primary)",
          }}
        >
          <PenSquare className="w-4 h-4" />
        </button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md text-white p-0 overflow-hidden rounded-2xl border-0"
        style={{
          background: "var(--nx-surface-4)",
          border: "1px solid var(--nx-glass-border-bright)",
        }}
      >
        <DialogHeader
          className="p-6"
          style={{
            background: "var(--nx-surface-1)",
            borderBottom: "1px solid var(--nx-glass-border)",
          }}
        >
          <DialogTitle className="text-lg font-semibold tracking-tight">
            New Chat
          </DialogTitle>
          <p className="text-sm mt-1" style={{ color: "var(--nx-text-tertiary)" }}>
            Select a user to start chatting
          </p>
        </DialogHeader>

        <div
          className="p-4"
          style={{ borderBottom: "1px solid var(--nx-glass-border)" }}
        >
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--nx-text-ghost)" }}
            />
            <Input
              placeholder="Search users..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="pl-9 text-white placeholder:text-zinc-600 rounded-xl"
              style={{
                background: "var(--nx-surface-3)",
                borderColor: "var(--nx-glass-border)",
              }}
            />
          </div>
        </div>

        <ScrollArea className="max-h-[300px] min-h-[200px] p-2">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  border: "1px dashed var(--nx-glass-border-bright)",
                  background: "var(--nx-glass-bg)",
                }}
              >
                <Search
                  className="w-5 h-5"
                  style={{ color: "var(--nx-text-ghost)" }}
                />
              </div>
              <p className="text-sm" style={{ color: "var(--nx-text-ghost)" }}>
                No users found
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelect(user._id)}
                  className="flex items-center gap-3 p-3 rounded-xl w-full text-left transition-colors duration-200 cursor-pointer hover:bg-white/5"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback
                      className="text-white font-medium text-xs"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--nx-accent-600), var(--nx-violet-500))",
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium truncate text-sm"
                      style={{ color: "var(--nx-text-primary)" }}
                    >
                      {user.name}
                    </h3>
                    <p
                      className="text-xs truncate mt-0.5"
                      style={{ color: "var(--nx-text-ghost)" }}
                    >
                      {user.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
