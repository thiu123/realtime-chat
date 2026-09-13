import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateMessageDto } from './dto/create-message.dto';
import { Message, MessageDocument } from './schemas/message.schema';

/** Các field của người gửi được trả kèm cho client. */
const SENDER_FIELDS = 'name email avatar';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  /** Tạo tin nhắn mới. */
  async create(senderId: string, createMessageDto: CreateMessageDto) {
    const message = new this.messageModel({
      ...createMessageDto,
      senderId,
      readBy: [senderId], // người gửi coi như đã đọc tin của chính mình
    });
    await message.save();

    // populate để client nhận được luôn tên + avatar người gửi, khỏi gọi thêm API.
    return message.populate('senderId', SENDER_FIELDS);
  }

  /** Toàn bộ tin nhắn của một cuộc trò chuyện, sắp xếp từ cũ đến mới. */
  findByConversation(conversationId: string) {
    return this.messageModel
      .find({ conversationId })
      .populate('senderId', SENDER_FIELDS)
      .sort({ createdAt: 1 })
      .exec();
  }

  /** Lấy một tin nhắn, ném lỗi 404 nếu không tồn tại. */
  async findOne(messageId: string) {
    const message = await this.messageModel
      .findById(messageId)
      .populate('senderId', SENDER_FIELDS)
      .exec();

    if (!message) {
      throw new NotFoundException('Không tìm thấy tin nhắn');
    }

    return message;
  }

  /** Sửa nội dung tin nhắn. Chỉ người gửi mới có quyền sửa. */
  async update(messageId: string, senderId: string, content: string) {
    const message = await this.findOwnedMessage(messageId, senderId);

    message.content = content;
    await message.save();

    return message.populate('senderId', SENDER_FIELDS);
  }

  /** Xoá tin nhắn. Chỉ người gửi mới có quyền xoá. */
  async remove(messageId: string, senderId: string) {
    const message = await this.findOwnedMessage(messageId, senderId);
    await message.deleteOne();

    return { message: 'Đã xoá tin nhắn', messageId };
  }

  /**
   * Đánh dấu đã đọc toàn bộ tin nhắn chưa đọc trong một cuộc trò chuyện.
   * Trả về danh sách id vừa được đánh dấu để ChatGateway báo cho người gửi biết.
   */
  async markConversationAsRead(conversationId: string, userId: string) {
    const filter = {
      conversationId,
      senderId: { $ne: userId }, // không tính tin do chính mình gửi
      readBy: { $nin: [userId] }, // chỉ lấy tin mình chưa đọc
    };

    // Lấy id trước khi cập nhật, vì sau khi cập nhật thì không còn tin nào khớp filter.
    const unreadMessages = await this.messageModel
      .find(filter, { _id: 1 })
      .lean()
      .exec();

    if (unreadMessages.length === 0) {
      return { messageIds: [] as string[] };
    }

    const messageIds = unreadMessages.map((message) => String(message._id));

    // $addToSet: thêm userId vào mảng readBy, không thêm trùng.
    await this.messageModel.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: userId } },
    );

    return { messageIds };
  }

  /**
   * Lấy tin nhắn và kiểm tra quyền sở hữu.
   * Tách 2 loại lỗi cho rõ ràng: 404 (không có tin) và 403 (tin của người khác).
   */
  private async findOwnedMessage(messageId: string, senderId: string) {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new NotFoundException('Không tìm thấy tin nhắn');
    }

    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      throw new NotFoundException('Không tìm thấy tin nhắn');
    }

    if (message.senderId.toString() !== senderId) {
      throw new ForbiddenException(
        'Bạn chỉ thao tác được với tin nhắn của mình',
      );
    }

    return message;
  }
}
