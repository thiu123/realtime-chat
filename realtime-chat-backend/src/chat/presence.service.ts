import { Injectable } from '@nestjs/common';

/** Kết quả khi một socket ngắt kết nối. */
export interface DisconnectResult {
  userId: string;
  /** false nghĩa là user đã đóng hết tab -> thực sự offline. */
  isOnline: boolean;
}

/**
 * Ghi nhớ ai đang online, lưu trong RAM của server.
 *
 * Một người có thể mở nhiều tab, mỗi tab là một socket riêng, nên phải lưu
 * userId -> danh sách socketId. Chỉ khi tab cuối cùng đóng lại thì mới coi là offline.
 *
 * Lưu ý: dữ liệu này mất khi restart server. Muốn chạy nhiều server cùng lúc
 * thì phải chuyển sang lưu ở Redis.
 */
@Injectable()
export class PresenceService {
  /** socketId -> userId, dùng khi ngắt kết nối (lúc đó chỉ biết socketId). */
  private readonly userIdBySocket = new Map<string, string>();

  /** userId -> các socketId đang mở của người đó. */
  private readonly socketsByUser = new Map<string, Set<string>>();

  /** Gắn một socket vào một user. */
  addSocket(userId: string, socketId: string) {
    this.userIdBySocket.set(socketId, userId);

    const sockets = this.socketsByUser.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    this.socketsByUser.set(userId, sockets);
  }

  /**
   * Gỡ một socket khi client ngắt kết nối.
   * Trả về null nếu socket này chưa từng gửi 'presence:online'.
   */
  removeSocket(socketId: string): DisconnectResult | null {
    const userId = this.userIdBySocket.get(socketId);
    if (!userId) {
      return null;
    }

    this.userIdBySocket.delete(socketId);

    const sockets = this.socketsByUser.get(userId);
    sockets?.delete(socketId);

    const isOnline = Boolean(sockets && sockets.size > 0);
    if (!isOnline) {
      this.socketsByUser.delete(userId);
    }

    return { userId, isOnline };
  }

  /** Danh sách id những người đang online. */
  getOnlineUserIds(): string[] {
    return Array.from(this.socketsByUser.keys());
  }
}
