import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

// Các loại tin nhắn được hỗ trợ
export enum MessageType {
  TEXT = 'text',   // Tin nhắn văn bản thông thường
  EMOJI = 'emoji', // Tin nhắn chỉ gồm emoji
  IMAGE = 'image', // Tin nhắn hình ảnh
}

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId;

  @Prop({ type: String, enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  // Nội dung văn bản (không bắt buộc nếu là tin nhắn ảnh)
  @Prop({ type: String, required: false, default: '' })
  content: string;

  // Lưu ảnh dạng base64 string (cho tin nhắn hình ảnh)
  @Prop({ type: String, required: false })
  imageUrl: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Create indexes for better query performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
