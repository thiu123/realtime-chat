"use client";
import { useState, useRef } from "react";
import { Plus, Mic, Send, X, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmojiPickerButton } from "./EmojiPicker";

// ======================================================
// Props của MessageInput:
// - onSend: hàm gửi tin nhắn (text, emoji, hoặc ảnh)
// ======================================================
interface MessageInputProps {
  onSend: (message: string, type?: string, imageUrl?: string) => void;
  isTyping?: boolean;
  typingUser?: string;
}

export function MessageInput({ onSend, isTyping, typingUser }: MessageInputProps) {
  const [message, setMessage] = useState("");
  // imagePreview: lưu ảnh base64 để preview trước khi gửi
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // ref tới input file ẩn (để trigger click)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ======================================================
  // Gửi tin nhắn (text / emoji / ảnh)
  // ======================================================
  const handleSend = () => {
    // Nếu có ảnh → gửi ảnh (kèm caption nếu người dùng gõ)
    if (imagePreview) {
      onSend(message.trim(), "image", imagePreview);
      setMessage("");
      setImagePreview(null);
      return;
    }
    // Nếu chỉ có text → gửi text
    if (message.trim()) {
      onSend(message, "text");
      setMessage("");
    }
  };

  // Nhấn Enter để gửi (Shift+Enter = xuống dòng)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ======================================================
  // Xử lý khi user chọn emoji từ EmojiPicker
  // ======================================================
  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji); // Thêm emoji vào cuối text đang gõ
  };

  // ======================================================
  // Xử lý khi user chọn ảnh từ máy tính
  // ======================================================
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước ảnh (giới hạn 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large! Please choose an image under 2MB.");
      return;
    }

    // FileReader: đọc file và chuyển thành base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64); // Lưu vào state để preview
    };
    reader.readAsDataURL(file); // Bắt đầu đọc file

    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  const canSend = message.trim() || imagePreview;

  return (
    <div className="p-4 bg-zinc-900 border-t border-zinc-800">
      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 mb-3 text-sm text-zinc-400">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="bg-zinc-700 text-xs">
              {typingUser?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="flex items-center gap-1">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
            <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>●</span>
            <span className="ml-1">{typingUser || "User"} is typing...</span>
          </span>
        </div>
      )}

      {/* Preview ảnh đã chọn (hiện phía trên ô chat) */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Image preview"
            className="max-h-32 max-w-xs rounded-xl border-2 border-blue-600 object-cover"
          />
          {/* Nút X để bỏ ảnh đã chọn */}
          <button
            onClick={() => setImagePreview(null)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
            title="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="mt-1 text-xs text-zinc-400 flex items-center gap-1">
            <Image className="w-3 h-3" />
            <span>Image ready to send</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Nút "+" — mở dialog chọn ảnh */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => fileInputRef.current?.click()} // Trigger click vào input ẩn
          className="shrink-0 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded-full"
          title="Send image"
        >
          <Plus className="w-5 h-5" />
        </Button>

        {/* Input file ẩn — chỉ nhận file ảnh */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"          // Chỉ cho chọn ảnh
          onChange={handleImageSelect}
          className="hidden"         // Ẩn đi, trigger bằng JS
        />

        {/* Ô nhập tin nhắn */}
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imagePreview ? "Add caption (optional)..." : "Message..."}
            className="pr-20 pl-4 py-6 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-3xl focus-visible:ring-1 focus-visible:ring-blue-600"
          />

          {/* Các nút bên phải ô chat */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Emoji Picker (tự tạo, không cần npm) */}
            <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />

            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full h-8 w-8"
              title="Voice message"
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Nút gửi */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-full h-12 w-12 p-0 transition-all"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
