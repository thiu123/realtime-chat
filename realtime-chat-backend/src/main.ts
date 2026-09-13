import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

// Biến `module` của webpack, chỉ tồn tại khi chạy `npm run start:dev` (hot reload).
declare const module: {
  hot?: {
    accept(): void;
    dispose(callback: () => void): void;
  };
};

/**
 * Điểm khởi động của ứng dụng NestJS.
 * Thứ tự: tạo app -> cấu hình chung -> lắng nghe cổng.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Cho phép frontend (chạy ở port khác) gọi API -> nếu không sẽ bị chặn bởi CORS.
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000',
    credentials: true,
  });

  // Mọi route REST đều có tiền tố /api, ví dụ: POST /api/auth/login.
  // Lưu ý: WebSocket (Socket.IO) KHÔNG bị ảnh hưởng bởi prefix này.
  app.setGlobalPrefix('api');

  // Tự động kiểm tra dữ liệu client gửi lên dựa theo các class DTO.
  // Thiếu dòng này thì các decorator @IsEmail, @MinLength... trong DTO sẽ vô tác dụng.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // xoá field không được khai báo trong DTO
      transform: true, // ép payload thành đúng instance của class DTO
    }),
  );

  const port = config.get<number>('PORT') ?? 5000;
  await app.listen(port);
  console.log(`Server đang chạy tại http://localhost:${port}/api`);

  // Hot reload khi dev: nạp lại code mới mà không cần khởi động lại server.
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
      void app.close();
    });
  }
}

void bootstrap();
