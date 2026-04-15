"use client";
import { useState, useRef } from "react";
import { Plus, Mic, Send, X, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmojiPickerButton } from "./EmojiPicker";

interface MessageInputProps {
  onSend: (message: string, type?: string, imageUrl?: string) => void;
  isTyping?: boolean;
  typingUser?: string;
}

export function MessageInput({ onSend, isTyping, typingUser }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (imagePreview) {
      onSend(message.trim(), "image", imagePreview);
      setMessage("");
      setImagePreview(null);
      return;
    }
    if (message.trim()) {
      onSend(message, "text");
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large! Please choose an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const canSend = message.trim() || imagePreview;

  return (
    <div
      className="p-4"
      style={{
        background: "var(--nx-surface-2)",
        borderTop: "1px solid var(--nx-glass-border)",
      }}
    >
      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: "var(--nx-text-tertiary)" }}>
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs" style={{ background: "var(--nx-surface-4)", color: "var(--nx-text-tertiary)" }}>
              {typingUser?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="flex items-center gap-1">
            <span className="animate-bounce" style={{ color: "var(--nx-accent-400)" }}>●</span>
            <span className="animate-bounce" style={{ color: "var(--nx-accent-400)", animationDelay: "0.2s" }}>●</span>
            <span className="animate-bounce" style={{ color: "var(--nx-accent-400)", animationDelay: "0.4s" }}>●</span>
            <span className="ml-1">{typingUser || "User"} is typing...</span>
          </span>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Image preview"
            className="max-h-32 max-w-xs rounded-xl object-cover"
            style={{ border: "2px solid var(--nx-accent-500)" }}
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
            style={{ background: "var(--nx-danger)" }}
            title="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="mt-1 text-xs flex items-center gap-1" style={{ color: "var(--nx-text-tertiary)" }}>
            <Image className="w-3 h-3" />
            <span>Image ready to send</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Plus button */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-full h-10 w-10 transition-all duration-200"
          style={{ color: "var(--nx-text-tertiary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--nx-accent-400)";
            e.currentTarget.style.background = "var(--nx-glass-bg-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--nx-text-tertiary)";
            e.currentTarget.style.background = "transparent";
          }}
          title="Send image"
        >
          <Plus className="w-5 h-5" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Input field */}
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imagePreview ? "Add caption (optional)..." : "Message..."}
            className="pr-20 pl-4 py-6 text-white placeholder:text-zinc-600 rounded-2xl"
            style={{
              background: "var(--nx-surface-3)",
              borderColor: "var(--nx-glass-border)",
            }}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 transition-all duration-200"
              style={{ color: "var(--nx-text-tertiary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "white";
                e.currentTarget.style.background = "var(--nx-glass-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--nx-text-tertiary)";
                e.currentTarget.style.background = "transparent";
              }}
              title="Voice message"
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          className="shrink-0 text-white rounded-full h-11 w-11 p-0 transition-all duration-300 border-0 disabled:opacity-30 cursor-pointer"
          style={{
            background: canSend
              ? "linear-gradient(135deg, var(--nx-accent-500), var(--nx-violet-500))"
              : "var(--nx-surface-4)",
            boxShadow: canSend ? "0 0 20px rgba(99, 102, 241, 0.35)" : "none",
          }}
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
