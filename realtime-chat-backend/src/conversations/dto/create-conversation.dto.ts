import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsMongoId()
  participantId: string;
}
