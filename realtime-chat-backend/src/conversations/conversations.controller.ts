import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /** GET /api/conversations?userId=... - danh sách chat của một người. */
  @Get()
  findAllOfUser(@Query('userId') userId: string) {
    return this.conversationsService.findAllByUserId(userId);
  }

  /**
   * POST /api/conversations - body: { userId, participantId }
   * Trả về cuộc trò chuyện đã có, hoặc tạo mới nếu 2 người chưa từng nhắn tin.
   */
  @Post()
  create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.createOrGet(
      createConversationDto.userId,
      createConversationDto.participantId,
    );
  }

  /** GET /api/conversations/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  /** DELETE /api/conversations/:id */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationsService.remove(id);
  }
}
