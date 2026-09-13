import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDocument } from '../users/schemas/users.schema';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt-payload.interface';
import { LoginDto } from './dto/login.dto';

/** Số vòng băm của bcrypt: càng lớn càng chậm và càng khó bị dò mật khẩu. */
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /** Đăng ký tài khoản mới rồi đăng nhập luôn (trả về token). */
  async signup(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const user = await this.usersService.create({
      email: createUserDto.email,
      // Không nhập tên thì lấy tạm phần trước dấu @ của email.
      name: createUserDto.name?.trim() || createUserDto.email.split('@')[0],
      // Luôn hash mật khẩu trước khi lưu vào database.
      password: await bcrypt.hash(createUserDto.password, SALT_ROUNDS),
    });

    return this.buildAuthResponse(user);
  }

  /** Đăng nhập bằng email + mật khẩu. */
  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findByEmail(email);

    // Sai email hay sai mật khẩu đều trả về cùng một thông báo,
    // để người lạ không dò được email nào đã tồn tại trong hệ thống.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    return this.buildAuthResponse(user);
  }

  /** JwtStrategy gọi hàm này để lấy thông tin user từ id nằm trong token. */
  validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  /**
   * Ký token và chuẩn hoá dữ liệu trả về cho client.
   * Tách riêng vì cả signup và login đều cần kết quả giống hệt nhau.
   */
  private buildAuthResponse(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }
}
