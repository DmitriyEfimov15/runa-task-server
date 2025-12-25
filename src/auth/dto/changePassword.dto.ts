import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Password должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен быть минимум 6 символов' })
  newPassword: string;

  resetToken: string;
}
