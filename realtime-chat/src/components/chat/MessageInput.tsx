import { useState } from "react";
import { Plus, Smile, Mic, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageInputProps {
  onSend: (message: string) => void;
  isTyping?: boolean;
  typingUser?: string;
}

export function MessageInput({
  onSend,
  isTyping,
  typingUser,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-6 bg-zinc-900 border-t border-zinc-800">
      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 mb-3 text-sm text-zinc-400">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="bg-zinc-700 text-xs">
              {typingUser?.charAt(0) || "S"}
            </AvatarFallback>
          </Avatar>
          <span className="flex items-center gap-1">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
              ●
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
              ●
            </span>
            <span className="ml-1">{typingUser || "Sarah"} is typing...</span>
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full"
        >
          <Plus className="w-5 h-5" />
        </Button>

        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="pr-24 pl-4 py-6 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-3xl focus-visible:ring-1 focus-visible:ring-blue-600"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full h-8 w-8"
            >
              <Smile className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full h-8 w-8"
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 w-12 p-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
