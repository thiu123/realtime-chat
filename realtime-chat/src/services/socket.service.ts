import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;

  connect(token?: string) {
    if (this.socket?.connected) {
      console.log("🔵 Socket already connected");
      return;
    }

    console.log("🔌 Connecting to socket:", SOCKET_URL);
    console.log("🔑 With token:", token ? "✓" : "✗");

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: token ? { token } : undefined,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      console.log("Socket URL:", SOCKET_URL);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      console.error("Socket URL:", SOCKET_URL);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  disconnect() {  
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, payload?: any) {
    if (!this.socket) {
      console.error("Cannot emit - socket not initialized");
      return;
    }

    if (!this.socket.connected) {
      console.error("Cannot emit - socket not connected");
      console.error("Socket state:", {
        connected: this.socket.connected,
        disconnected: this.socket.disconnected,
      });
      return;
    }

    console.log(`Emitting event: ${event}`, payload);
    this.socket.emit(event, payload);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
