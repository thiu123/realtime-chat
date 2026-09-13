import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CreateUserDto } from '../users/dto/create-user.dto';
import type { UserDocument } from '../users/schemas/users.schema';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /api/auth/signup - body: { name?, email, password } */
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  /** POST /api/auth/login - body: { email, password } */
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * GET /api/auth/profile - thông tin của chính mình.
   * Cần gửi kèm header: Authorization: Bearer <access_token>
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: UserDocument) {
    return user;
  }
}
