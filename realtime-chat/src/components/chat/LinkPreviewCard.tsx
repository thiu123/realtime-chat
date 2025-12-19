import { LinkPreview } from "@/types/chat";

interface LinkPreviewCardProps {
  preview: LinkPreview;
}

export function LinkPreviewCard({ preview }: LinkPreviewCardProps) {
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-2 rounded-lg overflow-hidden bg-secondary hover:bg-accent transition-colors"
    >
      {preview.image && (
        <img
          src={preview.image}
          alt={preview.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-3">
        <p className="text-link text-sm font-medium">{preview.source}</p>
        <h4 className="text-foreground font-medium mt-1 line-clamp-2">{preview.title}</h4>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{preview.description}</p>
      </div>
    </a>
  );
}
