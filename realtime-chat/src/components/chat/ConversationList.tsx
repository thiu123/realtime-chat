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

export function ConversationList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "groups">(
    "all",
  );

  const user = useAuthStore((state) => state.user);
  const {
    conversations,
    activeConversationId,
    users,
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

  const handleSelectUser = (userId: string) => {
    handleStartChat(userId);
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "unread") {
      return matchesSearch && conv.unreadCount && conv.unreadCount > 0;
    }
    if (activeFilter === "groups") {
      return false; // Implement group logic if needed
    }
    return matchesSearch;
  });

  const unreadCount = conversations.filter(
    (c) => c.unreadCount && c.unreadCount > 0,
  ).length;

  return (
    <div className="w-full h-full bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-semibold text-white mb-4">Messages</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Badge
            variant={activeFilter === "all" ? "default" : "secondary"}
            className={cn(
              "cursor-pointer px-4 py-1 rounded-full",
              activeFilter === "all"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300",
            )}
            onClick={() => setActiveFilter("all")}
          >
            All
          </Badge>
          <Badge
            variant={activeFilter === "unread" ? "default" : "secondary"}
            className={cn(
              "cursor-pointer px-4 py-1 rounded-full",
              activeFilter === "unread"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300",
            )}
            onClick={() => setActiveFilter("unread")}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Badge>
          <Badge
            variant={activeFilter === "groups" ? "default" : "secondary"}
            className={cn(
              "cursor-pointer px-4 py-1 rounded-full",
              activeFilter === "groups"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300",
            )}
            onClick={() => setActiveFilter("groups")}
          >
            Groups
          </Badge>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-zinc-400 py-8">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => setActiveConversationId(conversation.id)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
