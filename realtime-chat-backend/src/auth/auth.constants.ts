/**
 * Các hằng số dùng chung cho phần xác thực.
 * Gom về một chỗ để nơi KÝ token (AuthModule) và nơi KIỂM TRA token (JwtStrategy)
 * không bao giờ dùng nhầm hai khoá bí mật khác nhau.
 */

/** Tên biến trong file .env chứa khoá bí mật để ký JWT. */
export const JWT_SECRET_ENV_KEY = 'JWT_ACCESS_KEY';

/** Khoá dự phòng khi quên khai báo .env - chỉ dùng lúc học, đừng deploy kiểu này. */
export const JWT_FALLBACK_SECRET = 'dev-secret-hay-doi-truoc-khi-deploy';

/** Token hết hạn sau 7 ngày. */
export const JWT_EXPIRES_IN = '7d';
