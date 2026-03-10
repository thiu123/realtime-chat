import { IsOptional, IsString, IsMongoId, IsIn } from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  conversationId: string;

  // Nội dung tin nhắn (optional vì tin nhắn ảnh có thể không có text)
  @IsOptional()
  @IsString()
  content?: string;

  // Loại tin nhắn: 'text', 'emoji', 'image'
  @IsOptional()
  @IsString()
  @IsIn(['text', 'emoji', 'image'])
  type?: string;

  // Ảnh dạng base64 string (chỉ dùng khi type = 'image')
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
