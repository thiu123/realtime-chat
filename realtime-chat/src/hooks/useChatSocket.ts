"use client";

import { useEffect, useState } from "react";

import { toUIConversation, toUIMessage, getSenderId } from "@/lib/chat-mappers";
import { getConversation } from "@/services/chat.service";
import { chatSocket } from "@/services/socket.service";
import { useAuthStore } from "@/stores/auth.store";
import { useChatStore } from "@/stores/chat.store";
import type { ApiMessage } from "@/types/api";

/**
 * Mở kết nối WebSocket và đồng bộ mọi sự kiện realtime vào chat store.
 *
 * Chỉ được dùng ở MỘT nơi duy nhất (app/page.tsx); nếu gọi ở nhiều component
 * thì mỗi component sẽ đăng ký thêm một bộ listener trùng nhau.
 *
 * Trả về tên người đang gõ (nếu có) để hiện dòng "... is typing".
 */
export function useChatSocket() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const usersLoaded = useChatStore((state) => state.users.length > 0);

  // Lưu kèm conversationId để khi đổi sang đoạn chat khác, trạng thái "đang gõ"
  // của đoạn chat cũ tự mất mà không cần thêm useEffect để dọn.
  const [typing, setTyping] = useState<{
    conversationId: string;
    userName: string;
  } | null>(null);

  const typingUser =
    typing?.conversationId === activeConversationId
      ? typing.userName
      : undefined;

  useEffect(() => {
    // Không có token thì khỏi mở socket: server sẽ từ chối ngay ở handshake.
    if (!currentUserId || !accessToken) return;

    // Các hàm dưới đây lấy state mới nhất bằng getState() thay vì đọc biến
    // trong closure, vì listener chỉ được đăng ký một lần.
    const store = () => useChatStore.getState();

    /**
     * Nhận tin nhắn từ một cuộc trò chuyện chưa có trong danh sách
     * (người lạ vừa nhắn lần đầu) -> tải thông tin cuộc trò chuyện đó về.
     */
    const ensureConversationLoaded = async (conversationId: string) => {
      const exists = store().conversations.some(
        (conversation) => conversation.id === conversationId,
      );
      if (exists) return;

      try {
        const conversation = await getConversation(conversationId);
        store().addConversation(toUIConversation(conversation, currentUserId));
      } catch (error) {
        console.error("Không tải được cuộc trò chuyện:", error);
      }
    };

    const handleNewMessage = async (message: ApiMessage) => {
      await ensureConversationLoaded(message.conversationId);

      const activeId = store().activeConversationId;
      const isActive = message.conversationId === activeId;

      if (isActive) {
        store().addMessage(toUIMessage(message));

        // Đang mở đoạn chat thì coi như đọc luôn tin vừa tới.
        if (getSenderId(message) !== currentUserId) {
          store().markConversationRead(activeId);
          chatSocket.markAsRead({ conversationId: activeId });
        }
      }

      store().applyIncomingMessage(message, {
        activeConversationId: activeId,
        currentUserId,
      });
    };

    chatSocket.connect(accessToken);

    // Mỗi hàm on() trả về hàm huỷ đăng ký, gom lại để cleanup một lượt.
    const unsubscribes = [
      chatSocket.on("presence:update", ({ userId, online }) => {
        store().setUserOnlineStatus(userId, online);
      }),

      chatSocket.on("presence:list", ({ onlineUserIds }) => {
        onlineUserIds.forEach((userId) =>
          store().setUserOnlineStatus(userId, true),
        );
      }),

      chatSocket.on("newMessage", (message) => {
        void handleNewMessage(message);
      }),

      chatSocket.on("messageUpdated", (message) => {
        if (message.conversationId !== store().activeConversationId) return;
        store().updateMessageContent(message._id, message.content);
      }),

      chatSocket.on("messageDeleted", ({ messageId }) => {
        store().removeMessage(messageId);
      }),

      chatSocket.on("userTyping", ({ conversationId, userId, isTyping }) => {
        const isOtherPersonInThisChat =
          conversationId === store().activeConversationId &&
          userId !== currentUserId;
        if (!isOtherPersonInThisChat) return;

        setTyping(
          isTyping
            ? {
                conversationId,
                userName: store().activeConversation()?.user.name ?? "User",
              }
            : null,
        );
      }),

      chatSocket.on("messagesRead", ({ conversationId, userId, messageIds }) => {
        if (conversationId !== store().activeConversationId) return;

        store().markMessagesRead(messageIds, userId);
        if (userId === currentUserId) {
          store().markConversationRead(conversationId);
        }
      }),

      // Server từ chối token ngay ở handshake -> phải đăng nhập lại.
      // Rớt mạng thì willRetry = true, socket.io tự nối lại nên bỏ qua.
      chatSocket.onConnectError((error, willRetry) => {
        if (willRetry) return;

        console.error("WebSocket bị từ chối:", error.message);
        clearAuth();
      }),

      // Xin lại danh sách online mỗi khi socket nối lại (ví dụ sau khi rớt mạng).
      chatSocket.onConnect(() => chatSocket.announceOnline()),
    ];

    chatSocket.announceOnline();

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      chatSocket.disconnect();
    };
  }, [currentUserId, accessToken, clearAuth]);

  // Danh sách user tải xong sau khi socket đã nối thì báo online lại,
  // để những người đang mở app thấy mình sáng đèn ngay.
  useEffect(() => {
    if (!currentUserId || !usersLoaded) return;

    chatSocket.announceOnline();
  }, [currentUserId, usersLoaded]);

  return { typingUser };
}
