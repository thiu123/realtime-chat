"use client";
import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

// ======================================================
// Danh sách emoji phổ biến nhất, chia theo nhóm
// ======================================================
const EMOJI_GROUPS = [
  {
    name: "Smileys",
    emojis: [
      "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊",
      "😋","😎","😍","🥰","😘","🤩","😜","😝","🤪","😏",
      "😒","😞","😔","😟","😕","🙁","😣","😖","😫","😩",
      "🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","😱",
      "😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶",
      "😐","😑","🙄","😬","🤐","🤢","🤮","🤧","😷","🤒",
    ],
  },
  {
    name: "Gestures",
    emojis: [
      "👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👋","🤚",
      "🖐️","✋","🙌","👏","🤲","🙏","💪","🦾","🦵","🦶",
      "👀","👁️","👅","👄","💋","🫦","🤜","🤛","👊","✊",
    ],
  },
  {
    name: "Hearts",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
      "❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️",
      "🫀","💌","💑","👫","👬","👭","💏",
    ],
  },
  {
    name: "Objects",
    emojis: [
      "🎉","🎊","🎁","🎂","🎈","🔥","⭐","✨","💫","🌟",
      "🎵","🎶","🎤","🎧","📱","💻","⌨️","🖥️","🖨️","📷",
      "📸","🎮","🕹️","🎯","🏆","🥇","💎","💍","👑","🪄",
    ],
  },
  {
    name: "Animals",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
      "🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🦄","🐔",
      "🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🦓","🦒",
    ],
  },
  {
    name: "Food",
    emojis: [
      "🍎","🍊","🍋","🍇","🍓","🫐","🍒","🍑","🥭","🍍",
      "🥥","🍕","🍔","🌮","🌯","🍜","🍣","🍱","🍙","🍚",
      "🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🍫","🍬",
    ],
  },
];

interface EmojiPickerProps {
  // Hàm được gọi khi user click vào 1 emoji
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPickerButton({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Đóng picker khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji); // Gọi callback để thêm emoji vào ô chat
    // Không đóng picker, để user có thể chọn nhiều emoji
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* Nút mở emoji picker */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-zinc-400 hover:text-yellow-400 hover:bg-zinc-700 rounded-full h-8 w-8 transition-colors"
        title="Choose emoji"
      >
        <Smile className="w-5 h-5" />
      </Button>

      {/* Popup emoji picker */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 z-50 w-80 rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
          {/* Tabs chọn nhóm emoji */}
          <div className="flex overflow-x-auto border-b border-zinc-800 bg-zinc-950 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
            {EMOJI_GROUPS.map((group, index) => (
              <button
                key={group.name}
                type="button"
                onClick={() => setActiveGroup(index)}
                className={`px-3 py-2 text-xs whitespace-nowrap transition-colors ${
                  activeGroup === index
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Grid emoji */}
          <div className="p-2 grid grid-cols-8 gap-0.5 max-h-52 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
            {EMOJI_GROUPS[activeGroup].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-950">
            <p className="text-xs text-zinc-500">Click emoji to add to message ✨</p>
          </div>
        </div>
      )}
    </div>
  );
}
