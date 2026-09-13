import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';

import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

/**
 * Các route quản lý người dùng, tất cả đều bắt đầu bằng /api/users.
 *
 * Muốn tạo user mới thì dùng POST /api/auth/signup (ở đó mật khẩu mới được hash),
 * nên ở controller này cố ý không có route POST.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /api/users */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /** GET /api/users/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /** PATCH /api/users/:id - body: { name?, avatar? } */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /** PATCH /api/users/:id/avatar - body: { avatar: "data:image/png;base64,..." } */
  @Patch(':id/avatar')
  updateAvatar(@Param('id') id: string, @Body() body: UpdateAvatarDto) {
    return this.usersService.update(id, { avatar: body.avatar });
  }

  /** DELETE /api/users/:id */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
