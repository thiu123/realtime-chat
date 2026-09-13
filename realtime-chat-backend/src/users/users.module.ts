import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  // forFeature: đăng ký schema User để inject được vào service bằng @InjectModel.
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  // exports: cho phép module khác (AuthModule) dùng lại UsersService.
  exports: [UsersService],
})
export class UsersModule {}
