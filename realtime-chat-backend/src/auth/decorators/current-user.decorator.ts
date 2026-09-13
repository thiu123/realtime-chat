import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { UserDocument } from '../../users/schemas/users.schema';

/**
 * Decorator tự viết để lấy user đang đăng nhập ra khỏi request.
 *
 * Sau khi JwtAuthGuard chạy xong, Passport gắn kết quả của JwtStrategy.validate()
 * vào `request.user`. Thay vì viết `@Request() req` rồi `req.user` (kiểu any),
 * ta dùng: `getProfile(@CurrentUser() user: UserDocument)`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserDocument => {
    const request = context.switchToHttp().getRequest<{ user: UserDocument }>();
    return request.user;
  },
);
