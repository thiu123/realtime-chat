import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/users.schema';

/** Loại bỏ trường password khỏi kết quả trả về cho client. */
const WITHOUT_PASSWORD = '-password';

/**
 * Service = nơi chứa logic nghiệp vụ và thao tác với database.
 * Controller chỉ nhận request rồi gọi xuống service.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Tạo user mới.
   * Lưu ý: password truyền vào phải được hash sẵn (xem AuthService.signup).
   */
  create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  /** Danh sách tất cả user (dùng để chọn người muốn nhắn tin). */
  findAll() {
    return this.userModel.find().select(WITHOUT_PASSWORD).exec();
  }

  /**
   * Tìm user theo id, trả về null nếu không có.
   * Dùng cho các luồng nội bộ cần tự xử lý trường hợp "không tìm thấy" (ví dụ: JWT).
   */
  async findById(id: string) {
    // Id sai định dạng ObjectId sẽ làm Mongoose ném lỗi -> kiểm tra trước cho an toàn.
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.userModel.findById(id).select(WITHOUT_PASSWORD).exec();
  }

  /** Giống findById nhưng ném lỗi 404 nếu không tìm thấy -> dùng cho REST API. */
  async findOne(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  /**
   * Tìm user theo email. Kết quả CÓ kèm password vì AuthService cần nó để
   * so sánh mật khẩu khi đăng nhập.
   */
  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  /** Cập nhật thông tin user, trả về bản ghi sau khi sửa (new: true). */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select(WITHOUT_PASSWORD)
      .exec();

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return { message: 'Đã xoá người dùng' };
  }
}
