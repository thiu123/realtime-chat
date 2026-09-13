import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** Body của POST /api/auth/login */
export class LoginDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  // Chỉ kiểm tra "có nhập hay không", không kiểm tra độ dài:
  // mật khẩu đúng hay sai là việc của AuthService.
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  password: string;
}
