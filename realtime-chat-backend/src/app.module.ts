import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';

/**
 * Module gốc của ứng dụng.
 * NestJS tổ chức code thành cây module: AppModule gom tất cả module con lại.
 */
@Module({
  imports: [
    // Đọc file .env. isGlobal: true -> mọi module đều inject được ConfigService.
    ConfigModule.forRoot({ isGlobal: true }),

    // Kết nối MongoDB. Dùng forRootAsync vì cần ConfigService đọc .env xong trước.
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URL') ??
          'mongodb://localhost:27017/realtime-chat',
      }),
    }),

    UsersModule, // CRUD người dùng
    AuthModule, // đăng ký / đăng nhập / xác thực bằng JWT
    ConversationsModule, // cuộc trò chuyện giữa 2 người
    MessagesModule, // tin nhắn trong cuộc trò chuyện
    ChatModule, // WebSocket: gửi/nhận tin nhắn realtime
  ],
  controllers: [AppController],
})
export class AppModule {}
