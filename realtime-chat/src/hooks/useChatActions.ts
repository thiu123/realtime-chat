"use client";

import { useCallback } from "react";

import { chatSocket } from "@/services/socket.service";
import { useAuthStore } from "@/stores/auth.store";
import { useChatStore } from "@/stores/chat.store";
import type { MessageType } from "@/types/api";

/**
 * Các hành động người dùng gửi lên server qua WebSocket.
 *
 * Gom vào một hook để component không phải tự lo lấy userId / conversationId
 * hiện tại mỗi lần gửi.
 */
export function useChatActions() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  const canSend = Boolean(currentUserId && activeConversationId);

  const sendMessage = useCallback(
    (content: string, type: MessageType = "text", imageUrl?: string) => {
      if (!currentUserId || !activeConversationId) return;

      chatSocket.sendMessage({
        conversationId: activeConversationId,
        senderId: currentUserId,
        content,
        type,
        imageUrl,
      });
    },
    [currentUserId, activeConversationId],
  );

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!currentUserId || !activeConversationId) return;

      chatSocket.updateMessage({
        conversationId: activeConversationId,
        messageId,
        senderId: currentUserId,
        content,
      });
    },
    [currentUserId, activeConversationId],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!currentUserId || !activeConversationId) return;

      chatSocket.deleteMessage({
        conversationId: activeConversationId,
        messageId,
        senderId: currentUserId,
      });
    },
    [currentUserId, activeConversationId],
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!currentUserId || !activeConversationId) return;

      chatSocket.setTyping({
        conversationId: activeConversationId,
        userId: currentUserId,
        isTyping,
      });
    },
    [currentUserId, activeConversationId],
  );

  return { canSend, sendMessage, editMessage, deleteMessage, setTyping };
}
