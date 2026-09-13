import { IsNotEmpty, IsString } from 'class-validator';

/** Body của PATCH /api/messages/:id */
export class UpdateMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  content: string;
}
