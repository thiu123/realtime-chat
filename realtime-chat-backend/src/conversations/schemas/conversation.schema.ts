import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

/**
 * Một cuộc trò chuyện 1-1 giữa 2 người.
 * lastMessage / lastMessageAt được lưu sẵn ở đây để hiển thị danh sách chat
 * mà không phải truy vấn bảng messages cho từng dòng.
 */
@Schema({ timestamps: true })
export class Conversation {
  /**
   * ref: 'User' cho phép dùng .populate() để lấy luôn thông tin người tham gia.
   *
   * Lưu ý: phải dùng MongooseSchema.Types.ObjectId (không phải Types.ObjectId)
   * thì Mongoose mới hiểu đây là khoá ngoại và tự ép chuỗi id thành ObjectId.
   */
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  participants: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Message' })
  lastMessage: Types.ObjectId;

  @Prop({ type: Date })
  lastMessageAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Tăng tốc truy vấn "tìm các cuộc trò chuyện có chứa user X".
ConversationSchema.index({ participants: 1 });
