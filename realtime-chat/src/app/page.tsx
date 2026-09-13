"use client";

import { AppSidebar } from "@/components/chat/AppSidebar";
import { ChatLoadingScreen } from "@/components/chat/ChatLoadingScreen";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { UserDetailPanel } from "@/components/chat/UserDetailPanel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatData } from "@/hooks/useChatData";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useChatStore } from "@/stores/chat.store";

/**
 * Màn hình chat chính: chia 3 cột (danh sách chat | khung chat | thông tin người kia).
 *
 * Toàn bộ phần "chạy ngầm" được tách ra hook để file này chỉ còn phần bố cục:
 * - useRequireAuth : chưa đăng nhập thì đá về /login
 * - useChatSocket  : kết nối realtime, đổ sự kiện vào store
 * - useChatData    : gọi REST API nạp dữ liệu vào store
 * - useChatActions : các hành động gửi lên server (gửi/sửa/xoá tin, đang gõ)
 */
export default function ChatPage() {
  const { user } = useRequireAuth();

  // Gọi useChatSocket trước useChatData để socket sẵn sàng khi cần emit.
  const { typingUser } = useChatSocket();
  useChatData();
  const { sendMessage, editMessage, deleteMessage, setTyping } =
    useChatActions();

  const loading = useChatStore((state) => state.loading);
  const activeConversation = useChatStore((state) =>
    state.activeConversation(),
  );

  if (!user) return null;
  if (loading) return <ChatLoadingScreen />;

  return (
    <div
      className="h-screen w-full overflow-hidden noise-bg"
      style={{ background: "var(--nx-surface-0)" }}
    >
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <AppSidebar />
        </ResizablePanel>

        <ResizableHandle
          className="w-px"
          style={{ background: "var(--nx-glass-border)" }}
        />

        <ResizablePanel defaultSize={50} minSize={30}>
          <ChatPanel
            typingUser={typingUser}
            onSendMessage={sendMessage}
            onTypingChange={setTyping}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
          />
        </ResizablePanel>

        {activeConversation && (
          <>
            <ResizableHandle
              className="w-px"
              style={{ background: "var(--nx-glass-border)" }}
            />
            <ResizablePanel
              defaultSize={25}
              minSize={20}
              maxSize={35}
              className="hidden lg:block"
            >
              <UserDetailPanel user={activeConversation.user} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
