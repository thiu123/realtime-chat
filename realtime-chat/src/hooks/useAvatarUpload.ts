"use client";

import { useState } from "react";

import { updateUserAvatar } from "@/services/chat.service";
import { useAuthStore } from "@/stores/auth.store";

/** Ảnh đại diện lưu base64 thẳng trong MongoDB nên phải giới hạn dung lượng. */
const MAX_AVATAR_SIZE = 500 * 1024; // 500KB

/** Đọc file ảnh thành chuỗi base64 dạng "data:image/png;base64,...". */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Không đọc được file ảnh"));
    reader.readAsDataURL(file);
  });
}

/**
 * Xử lý việc đổi ảnh đại diện: kiểm tra dung lượng, đọc file, gọi API,
 * rồi cập nhật luôn vào auth store để giao diện đổi ngay.
 */
export function useAvatarUpload() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = async (file: File) => {
    if (!currentUserId) return;

    if (file.size > MAX_AVATAR_SIZE) {
      alert("Ảnh quá lớn! Hãy chọn ảnh dưới 500KB.");
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await readFileAsBase64(file);
      await updateUserAvatar(currentUserId, base64);
      updateAvatar(base64);
    } catch (error) {
      console.error("Đổi ảnh đại diện thất bại:", error);
      alert("Không đổi được ảnh đại diện. Thử lại nhé!");
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, uploadAvatar };
}
