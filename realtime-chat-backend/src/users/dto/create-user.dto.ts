import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO (Data Transfer Object) mô tả dữ liệu client được phép gửi lên.
 * Các decorator phía dưới được ValidationPipe (khai báo ở main.ts) kiểm tra tự động.
 */
export class CreateUserDto {
  /** Không bắt buộc: nếu bỏ trống sẽ lấy phần trước @ của email làm tên. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}
