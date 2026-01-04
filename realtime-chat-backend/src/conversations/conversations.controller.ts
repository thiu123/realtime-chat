import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * 📖 GET /conversations?userId=xxx
   * Lấy tất cả conversations của 1 user
   */
  @Get()
  async getUserConversations(@Query('userId') userId: string) {
    return await this.conversationsService.findConversationsByUserId(userId);
  }

  /**
   * 💬 POST /conversations
   * Tạo conversation mới hoặc lấy conversation đã tồn tại giữa 2 users
   * Body: { userId: string, participantId: string }
   */
  @Post()
  async createConversation(
    @Body('userId') userId: string,
    @Body('participantId') participantId: string,
  ) {
    // Kiểm tra xem conversation đã tồn tại chưa
    const existing = await this.conversationsService.findConversationBetweenUsers(
      userId,
      participantId,
    );

    if (existing) {
      return existing;
    }

    // Tạo mới
    return await this.conversationsService.createConversation(userId, {
      participantId,
    });
  }

  /**
   * 🔍 GET /conversations/:id
   * Lấy conversation detail
   */
  @Get(':id')
  async getConversation(@Param('id') id: string) {
    return await this.conversationsService.findById(id);
  }

  /**
   * 🗑️ DELETE /conversations/:id
   * Xóa conversation
   */
  @Delete(':id')
  async deleteConversation(@Param('id') id: string) {
    await this.conversationsService.deleteConversation(id);
    return { message: 'Conversation deleted successfully' };
  }
}
