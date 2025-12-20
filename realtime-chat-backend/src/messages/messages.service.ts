import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  // TODO: Implement your methods here
  // Ví dụ:
  // - createMessage(userId, createMessageDto)
  // - findMessagesByConversationId(conversationId)
  // - updateMessage(messageId, content)
  // - deleteMessage(messageId)
}
