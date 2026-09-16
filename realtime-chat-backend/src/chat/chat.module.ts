import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';
import { ChatGateway } from './chat.gateway';
import { PresenceService } from './presence.service';
import { WsAuthService } from './ws-auth.service';

/**
 * Module phụ trách phần realtime (WebSocket).
 *
 * Gateway chỉ điều phối; mọi thao tác với database vẫn do MessagesService và
 * ConversationsService đảm nhiệm, nên logic không bị viết trùng hai nơi.
 *
 * AuthModule được import để WsAuthService dùng lại JwtService (đúng khoá bí mật)
 * và AuthService (kiểm tra user trong token còn tồn tại).
 */
@Module({
  imports: [MessagesModule, ConversationsModule, AuthModule],
  providers: [ChatGateway, PresenceService, WsAuthService],
})
export class ChatModule {}
