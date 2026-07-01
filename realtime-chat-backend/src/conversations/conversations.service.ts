import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Message, MessageDocument } from '../messages/schemas/message.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
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

    await newConversation.save();
    return newConversation.populate('participants', 'name email avatar');
  }

  /**
   * Tìm tất cả conversations của 1 user
   */
  async findConversationsByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }

    const userObjectId = new Types.ObjectId(userId);
    const conversations = await this.conversationModel
      .find({
        participants: userId,
      })
      .populate('participants', 'name email avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .lean()
      .exec();

    const conversationIds = conversations.map((conversation) =>
      conversation._id,
    );

    const unreadCounts = await this.messageModel
      .aggregate([
        {
          $match: {
            conversationId: { $in: conversationIds },
            senderId: { $ne: userObjectId },
            readBy: { $nin: [userObjectId] },
          },
        },
        {
          $group: {
            _id: '$conversationId',
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const unreadCountByConversation = new Map(
      unreadCounts.map((item) => [item._id.toString(), item.count]),
    );

    return conversations.map((conversation) => ({
      ...conversation,
      unreadCount:
        unreadCountByConversation.get(conversation._id.toString()) ?? 0,
    }));
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
      .populate('participants', 'name email avatar')
      .populate('lastMessage')
      .exec();
  }

  /**
   * Tìm conversation theo ID
   */
  async findById(conversationId: string): Promise<Conversation | null> {
    return this.conversationModel
      .findById(conversationId)
      .populate('participants', 'name email avatar')
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
