import { Module } from '@nestjs/common';

import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';
import { ChatGateway } from './chat.gateway';
import { PresenceService } from './presence.service';

/**
 * Module phụ trách phần realtime (WebSocket).
 *
 * Gateway chỉ điều phối; mọi thao tác với database vẫn do MessagesService và
 * ConversationsService đảm nhiệm, nên logic không bị viết trùng hai nơi.
 */
@Module({
  imports: [MessagesModule, ConversationsModule],
  providers: [ChatGateway, PresenceService],
})
export class ChatModule {}
