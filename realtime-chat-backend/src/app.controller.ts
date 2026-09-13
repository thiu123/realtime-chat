import { Controller, Get } from '@nestjs/common';

/**
 * Controller = nơi khai báo các route HTTP.
 * @Controller() không có tham số nên route bắt đầu ngay sau prefix /api.
 */
@Controller()
export class AppController {
  /** GET /api/health - dùng để kiểm tra server có đang sống hay không. */
  @Get('health')
  checkHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
