"use client";

import { Image as ImageIcon, X } from "lucide-react";
import NextImage from "next/image";

interface ImageAttachmentPreviewProps {
  /** Ảnh dạng base64 đang chờ gửi. */
  src: string;
  onRemove: () => void;
}

/** Ảnh xem trước hiện phía trên ô nhập, kèm nút bỏ chọn. */
export function ImageAttachmentPreview({
  src,
  onRemove,
}: ImageAttachmentPreviewProps) {
  return (
    <div className="mb-3 relative inline-block">
      <NextImage
        src={src}
        alt="Image preview"
        width={320}
        height={128}
        unoptimized // ảnh base64, Next không tối ưu được
        className="max-h-32 max-w-xs rounded-xl object-cover"
        style={{ border: "2px solid var(--nx-accent-500)" }}
      />

      <button
        onClick={onRemove}
        title="Remove image"
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg transition-colors cursor-pointer"
        style={{ background: "var(--nx-danger)" }}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div
        className="mt-1 text-xs flex items-center gap-1"
        style={{ color: "var(--nx-text-tertiary)" }}
      >
        <ImageIcon className="w-3 h-3" aria-hidden="true" />
        <span>Image ready to send</span>
      </div>
    </div>
  );
}
