import { Search, Menu } from "lucide-react";
import { Conversation } from "@/types/chat";
import { ConversationItem } from "./ConversationItem";
import { Input } from "@/components/ui/input";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="w-[380px] h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeId}
            onClick={() => onSelect(conversation.id)}
          />
        ))}
      </div>
    </div>
  );
}
