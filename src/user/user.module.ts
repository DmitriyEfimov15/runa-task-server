import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { TokensModule } from 'src/tokens/tokens.module';
import { MailModule } from 'src/mail/mail.module';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { S3Module } from 'src/s3/s3.module';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, AuthService],
  imports: [TokensModule, MailModule, S3Module],
  exports: [UserService],
})
export class UserModule {}
