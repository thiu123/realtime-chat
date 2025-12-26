import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * 📖 READ - Lấy tất cả tin nhắn của 1 cuộc trò chuyện
   * GET /messages/conversation/:conversationId
   */
  @Get('conversation/:conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    return await this.messagesService.findByConversation(conversationId);
  }

  /**
   * 🔍 READ - Lấy 1 tin nhắn cụ thể
   * GET /messages/:id
   */
  @Get(':id')
  async getMessage(@Param('id') id: string) {
    return await this.messagesService.findOne(id);
  }

  /**
   * ✏️ UPDATE - Sửa tin nhắn
   * PATCH /messages/:id
   * Body: { content: string }
   *
   * Lưu ý: Trong thực tế cần thêm @UseGuards(JwtAuthGuard)
   * để lấy userId từ token, ở đây demo đơn giản
   */
  @Patch(':id')
  async updateMessage(
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('senderId') senderId: string, // Thực tế lấy từ JWT token
  ) {
    return await this.messagesService.update(id, senderId, content);
  }

  /**
   * 🗑️ DELETE - Xóa tin nhắn
   * DELETE /messages/:id
   * Body: { senderId: string }
   *
   * Lưu ý: Trong thực tế cần thêm @UseGuards(JwtAuthGuard)
   */
  @Delete(':id')
  async deleteMessage(
    @Param('id') id: string,
    @Body('senderId') senderId: string, // Thực tế lấy từ JWT token
  ) {
    return await this.messagesService.delete(id, senderId);
  }
}
