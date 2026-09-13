import { IsString } from 'class-validator';

/** Body của PATCH /api/users/:id/avatar */
export class UpdateAvatarDto {
  /** Ảnh dạng base64, ví dụ: "data:image/png;base64,iVBORw0KG..." */
  @IsString()
  avatar: string;
}
