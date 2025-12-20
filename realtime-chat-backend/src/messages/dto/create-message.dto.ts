import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  conversationId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
