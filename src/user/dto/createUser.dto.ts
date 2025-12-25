import { IsEmail, IsString, MinLength, MaxLength, IsUUID, IsNumber, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @IsString({ message: 'Password должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен быть минимум 6 символов' })
  password: string;

  @IsUUID()
  activationLink: string;

  @IsNumber()
  @Length(6, 6, { message: 'Activation code должен состоять из 6 цифр' })
  activationCode: number;
}
