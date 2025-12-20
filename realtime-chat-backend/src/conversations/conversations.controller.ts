import { Controller } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  // TODO: Implement your routes here
  // Ví dụ:
  // @Get() - Lấy danh sách conversations
  // @Post() - Tạo conversation mới
  // @Get(':id') - Lấy conversation detail
}
