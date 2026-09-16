import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import {
  JWT_FALLBACK_SECRET,
  JWT_SECRET_ENV_KEY,
} from '../auth/auth.constants';
import { AuthService } from '../auth/auth.service';
import { JwtPayload } from '../auth/jwt-payload.interface';
import type { ChatSocket } from './chat.types';

/**
 * Xác thực JWT cho kết nối WebSocket.
 *
 * REST đã có JwtAuthGuard lo việc này, nhưng WebSocket không đi qua guard đó:
 * handshake chỉ xảy ra MỘT lần lúc kết nối, nên phải tự kiểm tra token tại đó
 * rồi nhớ userId vào `client.data` cho mọi sự kiện sau dùng lại.
 *
 * Không có bước này thì client tự khai `senderId` là ai cũng được -> mở DevTools
 * là gửi được tin nhắn dưới tên người khác.
 */
@Injectable()
export class WsAuthService {
  private readonly logger = new Logger(WsAuthService.name);
  private readonly secret: string;

  constructor(
    config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {
    this.secret = config.get<string>(JWT_SECRET_ENV_KEY) ?? JWT_FALLBACK_SECRET;
  }

  /**
   * Trả về userId lấy từ token, hoặc null nếu thiếu token / token sai / hết hạn /
   * user đã bị xoá khỏi database.
   */
  async authenticate(client: ChatSocket): Promise<string | null> {
    const token = this.extractToken(client);
    if (!token) {
      return null;
    }

    try {
      // verifyAsync kiểm tra cả chữ ký lẫn hạn dùng (exp) của token.
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.secret,
      });

      // Token đúng chữ ký nhưng user có thể đã bị xoá -> phải kiểm tra lại.
      const user = await this.authService.validateUser(payload.sub);
      if (!user) {
        return null;
      }

      return user._id.toString();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'token không hợp lệ';
      this.logger.warn(`Từ chối socket ${client.id}: ${message}`);

      return null;
    }
  }

  /**
   * Token có thể nằm ở 3 chỗ, ưu tiên theo thứ tự:
   * 1. `auth: { token }` khi gọi io() - cách khuyến nghị của Socket.IO.
   * 2. Header `Authorization: Bearer <token>` - dùng khi client không phải browser.
   * 3. Query string `?token=` - phương án cuối, dễ bị ghi vào log của proxy.
   */
  private extractToken(client: ChatSocket): string | null {
    const handshake = client.handshake;

    const fromAuth: unknown = handshake.auth?.token;
    if (typeof fromAuth === 'string' && fromAuth.length > 0) {
      return this.stripBearer(fromAuth);
    }

    const fromHeader = handshake.headers?.authorization;
    if (typeof fromHeader === 'string' && fromHeader.length > 0) {
      return this.stripBearer(fromHeader);
    }

    const fromQuery: unknown = handshake.query?.token;
    if (typeof fromQuery === 'string' && fromQuery.length > 0) {
      return this.stripBearer(fromQuery);
    }

    return null;
  }

  /** Chấp nhận cả "Bearer abc" lẫn "abc" cho tiện phía client. */
  private stripBearer(value: string): string {
    return value.startsWith('Bearer ') ? value.slice(7).trim() : value.trim();
  }
}
