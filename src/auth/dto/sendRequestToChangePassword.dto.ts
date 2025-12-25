import { IsEmail } from 'class-validator';

export class SendRequestToChangePasswordDto {
  @IsEmail()
  email: string;
}
