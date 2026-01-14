import { Search, Plus } from "lucide-react";
import { useState, useCallback } from "react";
import { ConversationItem } from "./ConversationItem";
import { Input } from "@/components/ui/input";
import { UserProfileButton } from "./UserProfile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChatStore } from "@/stores/chat.store";
import { useAuthStore } from "@/stores/auth.store";
import { createOrGetConversation } from "@/services/chat.service";
import { toUIConversation } from "@/stores/chat.store";

export function ConversationList() {
  const [dialogOpen, setDialogOpen] = useState(false);

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
          participantId
        );
        const formatted = toUIConversation(conversation, user.id);

        addConversation(formatted);
        setActiveConversationId(formatted.id);
        setDialogOpen(false);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [user, addConversation, setActiveConversationId]
  );

  const handleSelectUser = (userId: string) => {
    handleStartChat(userId);
  };

  return (
    <div className="flex-1 bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <UserProfileButton />
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Nút tạo chat mới */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bắt đầu cuộc trò chuyện mới</DialogTitle>
            </DialogHeader>
            <div className="max-h-75 overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Không có user nào
                </p>
              ) : (
                users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleSelectUser(user._id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {conversations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Chưa có cuộc trò chuyện nào
          </p>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => setActiveConversationId(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
