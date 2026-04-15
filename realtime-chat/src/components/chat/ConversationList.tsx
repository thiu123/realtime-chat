"use client";

import { Search } from "lucide-react";
import { useState, useCallback } from "react";
import { ConversationItem } from "./ConversationItem";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/chat.store";
import { useAuthStore } from "@/stores/auth.store";
import { createOrGetConversation } from "@/services/chat.service";
import { toUIConversation } from "@/stores/chat.store";
import { cn } from "@/lib/utils";
import { ContactsModal } from "./ContactsModal";

export function ConversationList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "groups">(
    "all",
  );

  const user = useAuthStore((state) => state.user);
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

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        background: "var(--nx-surface-2)",
        borderRight: "1px solid var(--nx-glass-border)",
      }}
    >
      {/* Header */}
      <div className="p-5 pb-4" style={{ borderBottom: "1px solid var(--nx-glass-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white tracking-tight">Messages</h1>
        </div>

        {/* New Chat Button */}
        <ContactsModal onSelectUser={handleStartChat} />

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--nx-text-ghost)" }} />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-white placeholder:text-zinc-600 rounded-xl h-10"
            style={{
              background: "var(--nx-surface-3)",
              borderColor: "var(--nx-glass-border)",
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["all", "unread"] as const).map((filter) => (
            <Badge
              key={filter}
              variant={activeFilter === filter ? "default" : "secondary"}
              className={cn(
                "cursor-pointer px-4 py-1 rounded-full text-xs font-medium transition-all duration-200",
              )}
              style={{
                background: activeFilter === filter
                  ? "linear-gradient(135deg, var(--nx-accent-600), var(--nx-violet-600))"
                  : "var(--nx-surface-3)",
                color: activeFilter === filter ? "white" : "var(--nx-text-secondary)",
                border: activeFilter === filter ? "none" : "1px solid var(--nx-glass-border)",
                boxShadow: activeFilter === filter ? "0 0 12px rgba(99, 102, 241, 0.25)" : "none",
              }}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
            </Badge>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-16 px-4 flex flex-col items-center justify-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--nx-glass-bg)", border: "1px solid var(--nx-glass-border)" }}
            >
              <Search className="w-6 h-6" style={{ color: "var(--nx-text-ghost)" }} />
            </div>
            <p className="font-medium text-sm" style={{ color: "var(--nx-text-secondary)" }}>No messages yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--nx-text-ghost)" }}>Click &quot;New Chat&quot; to start</p>
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
    </div>
  );
}
