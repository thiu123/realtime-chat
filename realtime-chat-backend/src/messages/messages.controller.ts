import { Controller } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // TODO: Implement your routes here
  // Ví dụ:
  // @Get('conversation/:conversationId') - Lấy messages của conversation
  // @Post() - Tạo message mới (hoặc dùng WebSocket)
  // @Patch(':id') - Update message
  // @Delete(':id') - Delete message
}
