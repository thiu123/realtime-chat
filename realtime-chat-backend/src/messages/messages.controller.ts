import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UserDocument } from '../users/schemas/users.schema';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesService } from './messages.service';

/**
 * Các route REST cho tin nhắn.
 *
 * Trong ứng dụng chat, việc GỬI tin nhắn đi qua WebSocket (xem ChatGateway)
 * để mọi người nhận được ngay lập tức. REST ở đây dùng để tải lịch sử tin nhắn
 * và để sửa/xoá khi không cần realtime.
 */
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * GET /api/messages/conversation/:conversationId
   *
   * Route này phải khai báo TRƯỚC @Get(':id'), nếu không NestJS sẽ hiểu
   * "conversation" chính là giá trị của :id.
   */
  @Get('conversation/:conversationId')
  findByConversation(@Param('conversationId') conversationId: string) {
    return this.messagesService.findByConversation(conversationId);
  }

  /** GET /api/messages/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  /**
   * PATCH /api/messages/:id - body: { content }
   *
   * Có JwtAuthGuard nên id người sửa được lấy từ token, không lấy từ body:
   * nếu tin người dùng tự khai senderId thì ai cũng sửa được tin của người khác.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.messagesService.update(
      id,
      user._id.toString(),
      updateMessageDto.content,
    );
  }

  /** DELETE /api/messages/:id */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.messagesService.remove(id, user._id.toString());
  }
}
