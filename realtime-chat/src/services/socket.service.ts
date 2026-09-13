import { io, Socket } from "socket.io-client";

import type { ApiMessage, MessageType } from "@/types/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

/**
 * Tên các sự kiện WebSocket, phải khớp chính xác với @SubscribeMessage
 * và server.emit() bên backend (xem realtime-chat-backend/src/chat/chat.gateway.ts).
 */
export const SOCKET_EVENTS = {
  // Client -> Server
  presenceOnline: "presence:online",
  joinConversation: "joinConversation",
  sendMessage: "sendMessage",
  updateMessage: "updateMessage",
  deleteMessage: "deleteMessage",
  typing: "typing",
  markAsRead: "markAsRead",

  // Server -> Client
  presenceUpdate: "presence:update",
  presenceList: "presence:list",
  newMessage: "newMessage",
  messageUpdated: "messageUpdated",
  messageDeleted: "messageDeleted",
  userTyping: "userTyping",
  messagesRead: "messagesRead",
} as const;

/** Dữ liệu server gửi xuống, khai báo sẵn để chỗ nghe sự kiện có gợi ý kiểu. */
export interface PresenceUpdatePayload {
  userId: string;
  online: boolean;
}

export interface PresenceListPayload {
  onlineUserIds: string[];
}

export interface UserTypingPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessagesReadPayload {
  conversationId: string;
  userId: string;
  messageIds: string[];
}

export interface MessageDeletedPayload {
  messageId: string;
}

/** Bảng tra: tên sự kiện server gửi xuống -> kiểu dữ liệu kèm theo. */
interface ServerEventPayloads {
  "presence:update": PresenceUpdatePayload;
  "presence:list": PresenceListPayload;
  newMessage: ApiMessage;
  messageUpdated: ApiMessage;
  messageDeleted: MessageDeletedPayload;
  userTyping: UserTypingPayload;
  messagesRead: MessagesReadPayload;
}

type ServerEventName = keyof ServerEventPayloads & string;

/**
 * Bọc socket.io-client lại thành một đối tượng duy nhất cho cả app.
 *
 * Ưu điểm so với việc gọi `socket.emit("sendMessage", ...)` rải rác trong component:
 * tên sự kiện và hình dạng dữ liệu chỉ khai báo ở một chỗ, gõ sai là TypeScript báo ngay.
 */
class ChatSocket {
  private socket: Socket | null = null;

  /** Mở kết nối. Gọi nhiều lần cũng chỉ tạo một socket duy nhất. */
  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, { transports: ["websocket"] });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  /** Lắng nghe sự kiện từ server. Trả về hàm để huỷ lắng nghe. */
  on<Event extends ServerEventName>(
    event: Event,
    handler: (payload: ServerEventPayloads[Event]) => void,
  ) {
    // socket.io khai báo listener kiểu (...args: any[]), còn ta muốn chỉ nhận
    // đúng một payload đã biết kiểu -> ép kiểu một lần duy nhất ở đây.
    const eventName: string = event;
    const listener = handler as (...args: unknown[]) => void;

    this.socket?.on(eventName, listener);

    return () => {
      this.socket?.off(eventName, listener);
    };
  }

  /**
   * Lắng nghe lúc socket kết nối (hoặc kết nối lại sau khi rớt mạng).
   * "connect" là sự kiện có sẵn của socket.io nên tách ra một hàm riêng.
   */
  onConnect(handler: () => void) {
    this.socket?.on("connect", handler);

    return () => {
      this.socket?.off("connect", handler);
    };
  }

  // --- Các việc client gửi lên server -----------------------------------

  /** Báo mình vừa online (để mọi người thấy chấm xanh). */
  announceOnline(userId: string) {
    this.emit(SOCKET_EVENTS.presenceOnline, { userId });
  }

  /** Vào "phòng" của một cuộc trò chuyện để nhận sự kiện của riêng phòng đó. */
  joinConversation(conversationId: string) {
    this.emit(SOCKET_EVENTS.joinConversation, { conversationId });
  }

  sendMessage(payload: {
    conversationId: string;
    senderId: string;
    content: string;
    type: MessageType;
    imageUrl?: string;
  }) {
    this.emit(SOCKET_EVENTS.sendMessage, payload);
  }

  updateMessage(payload: {
    conversationId: string;
    messageId: string;
    senderId: string;
    content: string;
  }) {
    this.emit(SOCKET_EVENTS.updateMessage, payload);
  }

  deleteMessage(payload: {
    conversationId: string;
    messageId: string;
    senderId: string;
  }) {
    this.emit(SOCKET_EVENTS.deleteMessage, payload);
  }

  setTyping(payload: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) {
    this.emit(SOCKET_EVENTS.typing, payload);
  }

  markAsRead(payload: { conversationId: string; userId: string }) {
    this.emit(SOCKET_EVENTS.markAsRead, payload);
  }

  private emit(event: string, payload: unknown) {
    this.socket?.emit(event, payload);
  }
}

export const chatSocket = new ChatSocket();
