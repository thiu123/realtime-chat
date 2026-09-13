/**
 * Nội dung được nhét vào bên trong JWT khi đăng nhập thành công.
 * `sub` (subject) là quy ước chuẩn của JWT để lưu id người dùng.
 */
export interface JwtPayload {
  sub: string;
  email: string;
}
