"use client";

import { Mic, Plus, Send } from "lucide-react";
import { useRef, useState } from "react";

import { EmojiPickerButton } from "./EmojiPicker";
import { ImageAttachmentPreview } from "./ImageAttachmentPreview";
import { TypingIndicator } from "./TypingIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTypingNotifier } from "@/hooks/useTypingNotifier";
import type { MessageType } from "@/types/api";

/** Ảnh gửi kèm được lưu base64 trong MongoDB nên phải giới hạn dung lượng. */
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

interface MessageInputProps {
  typingUser?: string;
  onSend: (content: string, type?: MessageType, imageUrl?: string) => void;
  onTypingChange: (isTyping: boolean) => void;
}

export function MessageInput({
  typingUser,
  onSend,
  onTypingChange,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleInputChange, stopTyping } = useTypingNotifier(onTypingChange);

  const canSend = Boolean(text.trim() || imageBase64);

  const handleSend = () => {
    if (!canSend) return;

    if (imageBase64) {
      // Ảnh có thể kèm chú thích, nên vẫn gửi cả phần chữ.
      onSend(text.trim(), "image", imageBase64);
      setImageBase64(null);
    } else {
      onSend(text.trim(), "text");
    }

    setText("");
    stopTyping();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handlePickImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Xoá value ngay để chọn lại đúng file vừa rồi vẫn kích hoạt onChange.
    event.target.value = "";

    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Ảnh quá lớn! Hãy chọn ảnh dưới 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="p-4"
      style={{
        background: "var(--nx-surface-2)",
        borderTop: "1px solid var(--nx-glass-border)",
      }}
    >
      {typingUser && <TypingIndicator userName={typingUser} />}

      {imageBase64 && (
        <ImageAttachmentPreview
          src={imageBase64}
          onRemove={() => setImageBase64(null)}
        />
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Send image"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-full h-10 w-10 cursor-pointer hover:text-[var(--nx-accent-400)]"
          style={{ color: "var(--nx-text-tertiary)" }}
        >
          <Plus className="w-5 h-5" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePickImage}
          className="hidden"
        />

        <div className="flex-1 relative">
          <Input
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              handleInputChange(event.target.value);
            }}
            onKeyDown={handleKeyDown}
            onBlur={stopTyping}
            placeholder={
              imageBase64 ? "Add caption (optional)..." : "Message..."
            }
            className="pr-20 pl-4 py-6 text-white placeholder:text-zinc-600 rounded-2xl"
            style={{
              background: "var(--nx-surface-3)",
              borderColor: "var(--nx-glass-border)",
            }}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <EmojiPickerButton
              onEmojiSelect={(emoji) => setText((prev) => prev + emoji)}
            />

            {/* Nút ghi âm mới chỉ là giao diện, chưa có chức năng. */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Voice message (coming soon)"
              disabled
              className="rounded-full h-8 w-8"
              style={{ color: "var(--nx-text-tertiary)" }}
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!canSend}
          title="Send message"
          className="shrink-0 text-white rounded-full h-11 w-11 p-0 border-0 disabled:opacity-30 cursor-pointer transition-all duration-300"
          style={{
            background: canSend
              ? "linear-gradient(135deg, var(--nx-accent-500), var(--nx-violet-500))"
              : "var(--nx-surface-4)",
            boxShadow: canSend ? "0 0 20px rgba(99, 102, 241, 0.35)" : "none",
          }}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
