import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface ImageGridProps {
  images: string[];
  caption?: string;
}

export function ImageGrid({ images, caption }: ImageGridProps) {
  const displayImages = images.slice(0, 4);
  const remainingCount = images.length - 4;

  return (
    <div className="rounded-lg overflow-hidden">
      <div className={cn(
        "grid gap-0.5",
        displayImages.length === 1 && "grid-cols-1",
        displayImages.length === 2 && "grid-cols-2",
        displayImages.length >= 3 && "grid-cols-2"
      )}>
        {displayImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden",
              displayImages.length === 3 && index === 0 && "row-span-2"
            )}
          >
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover aspect-square"
            />
            {index === 3 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <span className="text-2xl font-semibold text-foreground">+{remainingCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {caption && (
        <div className="bg-secondary/80 px-3 py-2 flex items-center justify-between">
          <span className="text-foreground text-sm">{caption}</span>
          <ChevronDown className="w-5 h-5 text-primary" />
        </div>
      )}
    </div>
  );
}
