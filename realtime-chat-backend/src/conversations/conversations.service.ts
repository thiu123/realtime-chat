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

  /**
   * Tạo cuộc trò chuyện mới giữa 2 users
   */
  async createConversation(
    userId: string,
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const { participantId } = createConversationDto;

    // Kiểm tra xem conversation đã tồn tại chưa
    const existing = await this.findConversationBetweenUsers(
      userId,
      participantId,
    );
    if (existing) {
      return existing;
    }

    // Tạo mới
    const newConversation = new this.conversationModel({
      participants: [userId, participantId],
    });

    return newConversation.save();
  }

  /**
   * Tìm tất cả conversations của 1 user
   */
  async findConversationsByUserId(userId: string): Promise<Conversation[]> {
    return this.conversationModel
      .find({
        participants: userId,
      })
      .populate('participants', 'username email avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  /**
   * Tìm conversation giữa 2 users cụ thể
   */
  async findConversationBetweenUsers(
    userId1: string,
    userId2: string,
  ): Promise<Conversation | null> {
    return this.conversationModel
      .findOne({
        participants: { $all: [userId1, userId2] },
      })
      .exec();
  }

  /**
   * Tìm conversation theo ID
   */
  async findById(conversationId: string): Promise<Conversation | null> {
    return this.conversationModel
      .findById(conversationId)
      .populate('participants', 'username email avatar')
      .populate('lastMessage')
      .exec();
  }

  /**
   * Cập nhật lastMessage và lastMessageAt cho conversation
   */
  async updateLastMessage(
    conversationId: string,
    messageId: string,
  ): Promise<Conversation | null> {
    return this.conversationModel
      .findByIdAndUpdate(
        conversationId,
        {
          lastMessage: messageId,
          lastMessageAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Xóa conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await this.conversationModel.findByIdAndDelete(conversationId).exec();
  }
}
