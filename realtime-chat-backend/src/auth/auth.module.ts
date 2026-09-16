import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import {
  JWT_EXPIRES_IN,
  JWT_FALLBACK_SECRET,
  JWT_SECRET_ENV_KEY,
} from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule, // để dùng UsersService
    PassportModule,

    // Cấu hình nơi KÝ token. Khoá bí mật phải trùng với JwtStrategy.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(JWT_SECRET_ENV_KEY) ?? JWT_FALLBACK_SECRET,
        signOptions: { expiresIn: JWT_EXPIRES_IN },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // Export luôn JwtModule để ChatGateway xác thực token WebSocket bằng đúng
  // khoá bí mật đã dùng để ký, khỏi phải cấu hình lại lần thứ hai.
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
