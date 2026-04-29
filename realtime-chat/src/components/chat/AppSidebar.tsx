"use client";
import {
  MessageSquare,
  Search,
  MoreHorizontal,
  PenSquare,
  LogOut,
  User,
  Camera,
  Settings,
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
import { useState, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { updateUserAvatar } from "@/services/chat.service";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/chat.store";
import { createOrGetConversation } from "@/services/chat.service";
import { toUIConversation } from "@/stores/chat.store";
import { ConversationItem } from "./ConversationItem";
import { ContactsModal } from "./ContactsModal";

interface AppSidebarProps {
  currentUser?: {
    name: string;
    avatar?: string;
  };
}

export function AppSidebar({ currentUser }: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "groups">(
    "all",
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    addConversation,
  } = useChatStore();

  const handleStartChat = useCallback(
    async (participantId: string) => {
      if (!user) return;

      try {
        const conversation = await createOrGetConversation(
          user.id,
          participantId,
        );
        const formatted = toUIConversation(conversation, user.id);

        addConversation(formatted);
        setActiveConversationId(formatted.id);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [user, addConversation, setActiveConversationId],
  );

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

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "unread") {
      return matchesSearch && conv.unreadCount && conv.unreadCount > 0;
    }
    if (activeFilter === "groups") {
      return false;
    }
    return matchesSearch;
  });

  const unreadCount = conversations.filter(
    (c) => c.unreadCount && c.unreadCount > 0,
  ).length;

  const filters = [
    { id: "all" as const, label: "All" },
    { id: "unread" as const, label: "Unread" },
    { id: "groups" as const, label: "Groups" },
  ];

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        background: "var(--nx-surface-1)",
        borderRight: "1px solid var(--nx-glass-border)",
      }}
    >
      {/* Header - Messenger Style */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center justify-between mb-4">
          {/* User avatar + Title */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <div className="relative group">
                    <Avatar
                      className="w-9 h-9 cursor-pointer ring-2 transition-all duration-300"
                      style={{
                        ["--tw-ring-color" as string]: "transparent",
                      }}
                    >
                      <AvatarImage src={user?.avatar || currentUser?.avatar || undefined} />
                      <AvatarFallback
                        className="text-white text-sm font-semibold"
                        style={{ background: "linear-gradient(135deg, var(--nx-accent-600), var(--nx-violet-600))" }}
                      >
                        {user?.name?.charAt(0) || currentUser?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    {isUploadingAvatar && (
                      <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
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
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg focus:text-white"
                  style={{ color: "var(--nx-text-secondary)" }}
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

            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--nx-text-primary)" }}
            >
              Chats
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
              style={{ background: "var(--nx-surface-3)", color: "var(--nx-text-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--nx-surface-4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--nx-surface-3)";
              }}
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <ContactsModal onSelectUser={handleStartChat} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--nx-text-ghost)" }}
          />
          <Input
            placeholder="Search Messenger"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm rounded-full h-9 border-0"
            style={{
              background: "var(--nx-surface-3)",
              color: "var(--nx-text-primary)",
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
              )}
              style={{
                background: activeFilter === filter.id
                  ? "var(--nx-accent-600)"
                  : "var(--nx-surface-3)",
                color: activeFilter === filter.id
                  ? "white"
                  : "var(--nx-text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== filter.id) {
                  e.currentTarget.style.background = "var(--nx-surface-4)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== filter.id) {
                  e.currentTarget.style.background = "var(--nx-surface-3)";
                }
              }}
            >
              {filter.label}
              {filter.id === "unread" && unreadCount > 0 && ` (${unreadCount})`}
            </button>
          ))}

          <button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
            style={{ background: "var(--nx-surface-3)", color: "var(--nx-text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--nx-surface-4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--nx-surface-3)";
            }}
            title="More filters"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2 mt-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-16 px-4 flex flex-col items-center justify-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: "var(--nx-surface-3)" }}
            >
              <Search className="w-6 h-6" style={{ color: "var(--nx-text-ghost)" }} />
            </div>
            <p className="font-medium text-sm" style={{ color: "var(--nx-text-secondary)" }}>
              No messages yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--nx-text-ghost)" }}>
              Start a new conversation
            </p>
          </div>
        ) : (
          <div className="py-1">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => setActiveConversationId(conversation.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />
    </div>
  );
}
