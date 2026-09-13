import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard chặn request không có (hoặc có nhưng sai) JWT -> trả về 401.
 * Cách dùng: @UseGuards(JwtAuthGuard) trên controller hoặc trên từng route.
 *
 * Chuỗi 'jwt' là tên mặc định của JwtStrategy đã đăng ký trong AuthModule.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
