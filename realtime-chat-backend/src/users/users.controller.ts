import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Cập nhật avatar của user
   * Client gửi: { avatar: "data:image/png;base64,..." }
   */
  @Patch(':id/avatar')
  updateAvatar(
    @Param('id') id: string,
    @Body() body: { avatar: string },
  ) {
    // Dùng lại hàm update có sẵn, chỉ cập nhật trường avatar
    return this.usersService.update(id, { avatar: body.avatar });
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
