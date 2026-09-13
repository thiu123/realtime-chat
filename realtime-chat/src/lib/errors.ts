import axios from "axios";

/**
 * Lấy thông báo lỗi dễ đọc từ một lỗi bất kỳ.
 *
 * Viết hàm này để không phải dùng `catch (error: any)` rồi mò
 * `error.response.data.message` ở khắp nơi — vừa lặp code vừa mất type safety.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    // NestJS trả về mảng message khi ValidationPipe bắt lỗi nhiều field.
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }

  return fallback;
}
