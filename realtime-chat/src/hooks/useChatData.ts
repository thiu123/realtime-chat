"use client";

import { useEffect } from "react";

import { toUIConversation, toUIMessage } from "@/lib/chat-mappers";
import {
  getConversations,
  getMessages,
  getUsers,
} from "@/services/chat.service";
import { chatSocket } from "@/services/socket.service";
import { useAuthStore } from "@/stores/auth.store";
import { useChatStore } from "@/stores/chat.store";

/**
 * Nạp dữ liệu từ REST API vào chat store:
 * 1. Lần đầu vào trang: danh sách người dùng + danh sách cuộc trò chuyện.
 * 2. Mỗi khi đổi cuộc trò chuyện: lịch sử tin nhắn của cuộc đó.
 *
 * Phần realtime (tin nhắn mới, online/offline) nằm ở `useChatSocket`.
 */
export function useChatData() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  // 1. Tải danh sách ban đầu.
  useEffect(() => {
    // Đợi Zustand đọc xong localStorage, nếu không sẽ tưởng là chưa đăng nhập.
    if (!hasHydrated || !currentUserId) return;

    const store = useChatStore.getState();

    const loadInitialData = async () => {
      try {
        store.setLoading(true);

        const [users, conversations] = await Promise.all([
          getUsers(),
          getConversations(currentUserId),
        ]);

        // Bỏ chính mình ra khỏi danh sách người có thể nhắn tin.
        store.setUsers(users.filter((user) => user._id !== currentUserId));

        const uiConversations = conversations.map((conversation) =>
          toUIConversation(conversation, currentUserId),
        );
        store.setConversations(uiConversations);

        // Mở sẵn cuộc trò chuyện gần nhất cho đỡ trống trải.
        if (uiConversations.length > 0) {
          store.setActiveConversationId(uiConversations[0].id);
        }
      } catch (error) {
        console.error("Không tải được dữ liệu chat:", error);
      } finally {
        store.setLoading(false);
      }
    };

    void loadInitialData();
  }, [hasHydrated, currentUserId]);

  // 2. Tải tin nhắn mỗi khi người dùng mở một cuộc trò chuyện.
  useEffect(() => {
    if (!activeConversationId || !currentUserId) return;

    const store = useChatStore.getState();

    // Vào phòng để nhận sự kiện realtime của riêng cuộc trò chuyện này.
    chatSocket.joinConversation(activeConversationId);

    const loadMessages = async () => {
      try {
        const messages = await getMessages(activeConversationId);
        store.setMessages(messages.map(toUIMessage));

        // Mở ra là coi như đã đọc.
        store.markConversationRead(activeConversationId);
        chatSocket.markAsRead({ conversationId: activeConversationId });
      } catch (error) {
        console.error("Không tải được tin nhắn:", error);
      }
    };

    void loadMessages();
  }, [activeConversationId, currentUserId]);
}
