"use client";
import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPickerButton({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

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
    onEmojiSelect(emoji);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full h-8 w-8 transition-all duration-200"
        style={{ color: "var(--nx-text-tertiary)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#FBBF24";
          e.currentTarget.style.background = "var(--nx-glass-bg-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--nx-text-tertiary)";
          e.currentTarget.style.background = "transparent";
        }}
        title="Choose emoji"
      >
        <Smile className="w-5 h-5" />
      </Button>

      {isOpen && (
        <div
          className="absolute bottom-12 right-0 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
          style={{
            background: "var(--nx-surface-4)",
            border: "1px solid var(--nx-glass-border-bright)",
          }}
        >
          {/* Tab bar */}
          <div
            className="flex overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600"
            style={{
              background: "var(--nx-surface-1)",
              borderBottom: "1px solid var(--nx-glass-border)",
            }}
          >
            {EMOJI_GROUPS.map((group, index) => (
              <button
                key={group.name}
                type="button"
                onClick={() => setActiveGroup(index)}
                className="px-3 py-2.5 text-xs whitespace-nowrap transition-all duration-200"
                style={{
                  color: activeGroup === index ? "var(--nx-accent-400)" : "var(--nx-text-ghost)",
                  borderBottom: activeGroup === index ? "2px solid var(--nx-accent-400)" : "2px solid transparent",
                }}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div
            className="p-2 grid grid-cols-8 gap-0.5 max-h-52 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600"
          >
            {EMOJI_GROUPS[activeGroup].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all duration-150 cursor-pointer"
                style={{ background: "transparent" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--nx-glass-bg-hover)";
                  e.currentTarget.style.transform = "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div
            className="px-3 py-2"
            style={{
              background: "var(--nx-surface-1)",
              borderTop: "1px solid var(--nx-glass-border)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--nx-text-ghost)" }}>Click emoji to add to message ✨</p>
          </div>
        </div>
      )}
    </div>
  );
}
