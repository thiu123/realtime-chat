import { User } from "@/types/chat";
import { ChatAvatar } from "./Avatar";
import { Phone, Video, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  user: User;
}

export function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <div className="h-16 w-full px-6 flex items-center justify-between border-b border-zinc-800 bg-zinc-900">
      <div className="flex items-center gap-3">
        <ChatAvatar
          src={user.avatar}
          alt={user.name}
          size="sm"
          online={user.online}
        />
        <div>
          <h2 className="font-semibold text-white">{user?.name}</h2>
          <p className="text-sm text-green-500 flex items-center gap-1">
            {user.online && (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Online
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Phone className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Video className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Search className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
