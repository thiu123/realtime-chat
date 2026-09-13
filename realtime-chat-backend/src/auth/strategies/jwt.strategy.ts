import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { JWT_FALLBACK_SECRET, JWT_SECRET_ENV_KEY } from '../auth.constants';
import { JwtPayload } from '../jwt-payload.interface';

/**
 * Chịu trách nhiệm KIỂM TRA token ở mỗi request được bảo vệ bởi JwtAuthGuard.
 * Phải dùng đúng khoá bí mật mà AuthModule đã dùng để ký token.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      // Lấy token từ header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // token hết hạn thì từ chối
      secretOrKey:
        config.get<string>(JWT_SECRET_ENV_KEY) ?? JWT_FALLBACK_SECRET,
    });
  }

  /**
   * Chỉ chạy khi chữ ký token hợp lệ.
   * Giá trị trả về ở đây chính là `request.user` (lấy ra bằng @CurrentUser()).
   */
  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      // Token hợp lệ nhưng user đã bị xoá khỏi database.
      throw new UnauthorizedException();
    }

    return user;
  }
}
