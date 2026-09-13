import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Dữ liệu được phép sửa của một user.
 * Cố ý KHÔNG cho sửa email và password ở đây:
 * - email là định danh đăng nhập,
 * - password phải đi qua luồng riêng để được hash lại.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
