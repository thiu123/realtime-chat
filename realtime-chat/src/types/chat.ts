export interface User {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
  lastSeen?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
}

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image?: string;
  source: string;
}

export interface Message {
  id: string;
  senderId: string;
  content?: string;
  timestamp: string;
  type: 'text' | 'image' | 'link' | 'emoji';
  images?: string[];       // Ảnh cũ (giữ lại để tương thích)
  imageUrl?: string;       // Ảnh mới dạng base64 (từ feature này)
  link?: string;
  linkPreview?: LinkPreview;
  reactions?: Reaction[];
  read?: boolean;
  readBy?: string[];
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  muted?: boolean;
}
