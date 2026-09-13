import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

import { MessageType } from '../schemas/message.schema';

export class CreateMessageDto {
  @IsMongoId({ message: 'conversationId không hợp lệ' })
  conversationId: string;

  /** Không bắt buộc vì tin nhắn ảnh có thể không có chữ. */
  @IsOptional()
  @IsString()
  content?: string;

  /** 'text' | 'emoji' | 'image'. Bỏ trống thì mặc định là 'text'. */
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  /** Ảnh dạng base64, chỉ dùng khi type = 'image'. */
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
