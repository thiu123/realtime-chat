import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;

  connect(token?: string) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: token ? { token } : undefined,
    });

    this.socket.on("connect", () => {});
    this.socket.on("disconnect", () => {});
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, payload?: any) {
    if (!this.socket) return;
    this.socket.emit(event, payload);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  isConnected() {
    return !!this.socket?.connected;
  }
}

export const socketService = new SocketService();
