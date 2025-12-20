import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  // TODO: Implement your methods here
  // Ví dụ:
  // - createConversation(userId, participantId)
  // - findConversationsByUserId(userId)
  // - findConversationBetweenUsers(userId1, userId2)
  // - updateLastMessage(conversationId, messageId)
}
