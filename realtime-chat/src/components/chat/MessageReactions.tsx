import { Reaction } from "@/types/chat";

interface MessageReactionsProps {
  reactions: Reaction[];
}

export function MessageReactions({ reactions }: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex gap-1 mt-1">
      {reactions.map((reaction, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-reaction rounded-full text-sm"
        >
          {reaction.emoji}
          <span className="text-foreground">{reaction.count}</span>
        </span>
      ))}
    </div>
  );
}
