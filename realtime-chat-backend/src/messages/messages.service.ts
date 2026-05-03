import { Injectable, NotFoundException } from '@nestjs/common';
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

  /**
   * CREATE - Tạo tin nhắn mới
   * @param senderId - ID người gửi
   * @param createMessageDto - Dữ liệu tin nhắn (conversationId, content)
   */
  async create(senderId: string, createMessageDto: CreateMessageDto) {
    const newMessage = new this.messageModel({
      ...createMessageDto,
      senderId,
      readBy: [senderId],
    });

    const savedMessage = await newMessage.save();
    return await savedMessage.populate('senderId', 'name email avatar');
  }

  /**
   * READ - Lấy tất cả tin nhắn của 1 cuộc trò chuyện
   * @param conversationId - ID cuộc trò chuyện
   */
  async findByConversation(conversationId: string) {
    return await this.messageModel
      .find({ conversationId })
      .populate('senderId', 'name email avatar')
      .sort({ createdAt: 1 }) // Sắp xếp từ cũ đến mới
      .exec();
  }

  /**
   *  READ - Lấy 1 tin nhắn cụ thể
   * @param messageId - ID tin nhắn
   */
  async findOne(messageId: string) {
    const message = await this.messageModel
      .findById(messageId)
      .populate('senderId', 'name email')
      .exec();

    if (!message) {
      throw new NotFoundException('Không tìm thấy tin nhắn');
    }

    return message;
  }

  /**
   * UPDATE - Sửa nội dung tin nhắn
   * @param messageId - ID tin nhắn
   * @param senderId - ID người gửi (để check quyền)
   * @param content - Nội dung mới
   */
  async update(messageId: string, senderId: string, content: string) {
    const message = await this.messageModel.findOne({
      _id: messageId,
      senderId,
    });

    if (!message) {
      throw new NotFoundException(
        'Không tìm thấy tin nhắn hoặc bạn không có quyền sửa',
      );
    }

    message.content = content;
    const updatedMessage = await message.save();

    return await updatedMessage.populate('senderId', 'name email');
  }

  /**
   * DELETE - Xóa tin nhắn
   * @param messageId - ID tin nhắn
   * @param senderId - ID người gửi (để check quyền)
   */
  async delete(messageId: string, senderId: string) {
    const result = await this.messageModel.deleteOne({
      _id: messageId,
      senderId, // Chỉ cho phép người gửi xóa tin nhắn của mình
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        'Không tìm thấy tin nhắn hoặc bạn không có quyền xóa',
      );
    }

    return { message: 'Đã xóa tin nhắn thành công', messageId };
  }

  async markConversationAsRead(conversationId: string, userId: string) {
    const unreadMessages = await this.messageModel
      .find(
        {
          conversationId,
          senderId: { $ne: userId },
          readBy: { $nin: [userId] },
        },
        { _id: 1 },
      )
      .lean()
      .exec();

    const messageIds = unreadMessages.map((m) => m._id.toString());

    if (messageIds.length === 0) {
      return { messageIds: [] };
    }

    await this.messageModel.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: userId } },
    );

    return { messageIds };
  }
}
