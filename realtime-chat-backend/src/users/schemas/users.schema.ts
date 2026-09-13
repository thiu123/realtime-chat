import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * UserDocument = User + các thuộc tính của Mongoose (_id, save(), ...).
 * Dùng kiểu này khi làm việc với dữ liệu lấy từ database.
 */
export type UserDocument = HydratedDocument<User>;

/** Bảng (collection) `users` trong MongoDB. */
@Schema({ timestamps: true }) // tự thêm 2 cột createdAt, updatedAt
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  /** Mật khẩu đã được hash bằng bcrypt, KHÔNG bao giờ lưu dạng thô. */
  @Prop({ required: true })
  password: string;

  /** Ảnh đại diện, lưu dạng chuỗi base64 ("data:image/png;base64,..."). */
  @Prop({ default: '' })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
