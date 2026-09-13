"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ContactsModal } from "./ContactsModal";
import {
  ConversationFilters,
  type ConversationFilter,
} from "./ConversationFilters";
import { ConversationItem } from "./ConversationItem";
import { CurrentUserMenu } from "./CurrentUserMenu";
import { EmptyState } from "./EmptyState";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toUIConversation } from "@/lib/chat-mappers";
import { createOrGetConversation } from "@/services/chat.service";
import { useAuthStore } from "@/stores/auth.store";
import { useChatStore } from "@/stores/chat.store";
import type { Conversation } from "@/types/chat";

/** Lọc theo ô tìm kiếm + theo tab đang chọn. */
function filterConversations(
  conversations: Conversation[],
  keyword: string,
  filter: ConversationFilter,
): Conversation[] {
  const normalized = keyword.trim().toLowerCase();

  return conversations.filter((conversation) => {
    const matchesKeyword =
      !normalized ||
      conversation.user.name.toLowerCase().includes(normalized) ||
      conversation.lastMessage.toLowerCase().includes(normalized);

    if (filter === "unread") {
      return matchesKeyword && (conversation.unreadCount ?? 0) > 0;
    }

    return matchesKeyword;
  });
}

/** Cột trái: thông tin của mình, ô tìm kiếm, bộ lọc và danh sách cuộc trò chuyện. */
export function AppSidebar() {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");

  const currentUserId = useAuthStore((state) => state.user?.id);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const addConversation = useChatStore((state) => state.addConversation);
  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );

  const visibleConversations = useMemo(
    () => filterConversations(conversations, keyword, filter),
    [conversations, keyword, filter],
  );

  const unreadCount = conversations.filter(
    (conversation) => (conversation.unreadCount ?? 0) > 0,
  ).length;

  /** Chọn một người trong danh bạ: lấy (hoặc tạo) cuộc trò chuyện rồi mở luôn. */
  const handleStartChat = async (participantId: string) => {
    if (!currentUserId) return;

    try {
      const conversation = await createOrGetConversation(
        currentUserId,
        participantId,
      );
      const uiConversation = toUIConversation(conversation, currentUserId);

      addConversation(uiConversation);
      setActiveConversationId(uiConversation.id);
    } catch (error) {
      console.error("Không mở được cuộc trò chuyện:", error);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        background: "var(--nx-surface-1)",
        borderRight: "1px solid var(--nx-glass-border)",
      }}
    >
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CurrentUserMenu />
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--nx-text-primary)" }}
            >
              Chats
            </h1>
          </div>

          <ContactsModal onSelectUser={handleStartChat} />
        </div>

        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--nx-text-ghost)" }}
          />
          <Input
            placeholder="Search conversations"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="pl-10 text-sm rounded-full h-9 border-0"
            style={{
              background: "var(--nx-surface-3)",
              color: "var(--nx-text-primary)",
            }}
          />
        </div>

        <ConversationFilters
          value={filter}
          onChange={setFilter}
          unreadCount={unreadCount}
        />
      </div>

      <ScrollArea className="flex-1 px-2 mt-1">
        {visibleConversations.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No conversations"
            description="Start a new conversation"
          />
        ) : (
          <div className="py-1">
            {visibleConversations.map((conversation) => (
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
