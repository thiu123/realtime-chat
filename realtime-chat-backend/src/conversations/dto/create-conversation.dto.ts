import { IsMongoId } from 'class-validator';

/** Body của POST /api/conversations */
export class CreateConversationDto {
  /** Người tạo cuộc trò chuyện. */
  @IsMongoId({ message: 'userId không hợp lệ' })
  userId: string;

  /** Người còn lại trong cuộc trò chuyện. */
  @IsMongoId({ message: 'participantId không hợp lệ' })
  participantId: string;
}
