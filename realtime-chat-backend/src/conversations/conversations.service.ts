import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Message, MessageDocument } from '../messages/schemas/message.schema';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';

/** Các field của User được trả kèm khi populate (không lộ email/password thừa). */
const USER_FIELDS = 'name email avatar';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    // Cần model Message để đếm số tin nhắn chưa đọc của từng cuộc trò chuyện.
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Lấy cuộc trò chuyện giữa 2 người; chưa có thì tạo mới.
   * Nhờ vậy client chỉ cần gọi 1 API duy nhất khi bấm vào một người bạn.
   */
  async createOrGet(userId: string, participantId: string) {
    if (userId === participantId) {
      throw new BadRequestException('Không thể tự trò chuyện với chính mình');
    }

    const existing = await this.findBetweenUsers(userId, participantId);
    if (existing) {
      return existing;
    }

    const conversation = new this.conversationModel({
      participants: [userId, participantId],
    });
    await conversation.save();

    // populate để client nhận luôn tên + avatar của 2 người tham gia.
    return conversation.populate('participants', USER_FIELDS);
  }

  /**
   * Danh sách cuộc trò chuyện của một user, kèm số tin nhắn chưa đọc.
   * Sắp xếp theo tin nhắn mới nhất giống các app chat thông thường.
   */
  async findAllByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      return [];
    }

    // .lean() trả về object JavaScript thuần (nhẹ hơn document của Mongoose)
    // nhờ vậy bên dưới có thể thoải mái thêm field unreadCount.
    const conversations = await this.conversationModel
      .find({ participants: userId })
      .populate('participants', USER_FIELDS)
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .lean()
      .exec();

    const unreadCountByConversation = await this.countUnreadMessages(
      userId,
      conversations.map((conversation) => conversation._id),
    );

    return conversations.map((conversation) => ({
      ...conversation,
      unreadCount:
        unreadCountByConversation.get(conversation._id.toString()) ?? 0,
    }));
  }

  /** Tìm cuộc trò chuyện chứa đúng 2 người này ($all: chứa tất cả id trong mảng). */
  findBetweenUsers(userId: string, participantId: string) {
    return this.conversationModel
      .findOne({ participants: { $all: [userId, participantId] } })
      .populate('participants', USER_FIELDS)
      .populate('lastMessage')
      .exec();
  }

  /** Tìm theo id, trả về null nếu không có (dùng cho luồng nội bộ như ChatGateway). */
  async findById(conversationId: string) {
    if (!Types.ObjectId.isValid(conversationId)) {
      return null;
    }

    return this.conversationModel
      .findById(conversationId)
      .populate('participants', USER_FIELDS)
      .populate('lastMessage')
      .exec();
  }

  /** Giống findById nhưng ném lỗi 404 nếu không tìm thấy -> dùng cho REST API. */
  async findOne(conversationId: string) {
    const conversation = await this.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    return conversation;
  }

  /** Gọi mỗi khi có tin nhắn mới để danh sách chat luôn hiển thị đúng thứ tự. */
  updateLastMessage(conversationId: string, messageId: string) {
    return this.conversationModel
      .findByIdAndUpdate(
        conversationId,
        { lastMessage: messageId, lastMessageAt: new Date() },
        { new: true },
      )
      .exec();
  }

  async remove(conversationId: string) {
    const conversation = await this.conversationModel
      .findByIdAndDelete(conversationId)
      .exec();

    if (!conversation) {
      throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    }

    return { message: 'Đã xoá cuộc trò chuyện' };
  }

  /**
   * Đếm tin nhắn chưa đọc cho nhiều cuộc trò chuyện chỉ bằng MỘT câu truy vấn.
   * Trả về Map<conversationId, số tin chưa đọc>.
   *
   * Tin được coi là chưa đọc khi: không phải do mình gửi VÀ id của mình
   * chưa nằm trong mảng readBy.
   */
  private async countUnreadMessages(
    userId: string,
    conversationIds: Types.ObjectId[],
  ) {
    const currentUserId = new Types.ObjectId(userId);

    const results = await this.messageModel
      .aggregate<{ _id: Types.ObjectId; count: number }>([
        {
          $match: {
            conversationId: { $in: conversationIds },
            senderId: { $ne: currentUserId },
            readBy: { $nin: [currentUserId] },
          },
        },
        { $group: { _id: '$conversationId', count: { $sum: 1 } } },
      ])
      .exec();

    return new Map(
      results.map((item) => [item._id.toString(), item.count] as const),
    );
  }
}
