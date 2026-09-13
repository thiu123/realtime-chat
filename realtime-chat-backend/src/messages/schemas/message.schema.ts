import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

export enum MessageType {
  TEXT = 'text',
  EMOJI = 'emoji',
  IMAGE = 'image',
}

@Schema({ timestamps: true })
export class Message {
  // Lưu ý: phải dùng MongooseSchema.Types.ObjectId (không phải Types.ObjectId)
  // thì Mongoose mới hiểu đây là khoá ngoại và tự ép chuỗi id thành ObjectId.
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  })
  conversationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: String, enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  /** Nội dung chữ. Có thể rỗng nếu là tin nhắn ảnh không kèm chú thích. */
  @Prop({ type: String, default: '' })
  content: string;

  /** Ảnh lưu dạng chuỗi base64 (chỉ dùng khi type = 'image'). */
  @Prop({ type: String })
  imageUrl: string;

  /**
   * Danh sách id những người đã đọc tin nhắn này.
   * Người gửi được thêm vào ngay lúc tạo tin nhắn.
   */
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  readBy: Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Index giúp truy vấn nhanh hơn:
// - lấy tin nhắn của một cuộc trò chuyện theo thứ tự thời gian
MessageSchema.index({ conversationId: 1, createdAt: 1 });
// - đếm tin chưa đọc (lọc theo người gửi + người đã đọc)
MessageSchema.index({ conversationId: 1, senderId: 1, readBy: 1 });
