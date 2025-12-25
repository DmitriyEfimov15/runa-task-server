import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @IsString({ message: 'Password должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен быть минимум 6 символов' })
  password: string;
}
