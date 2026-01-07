import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { TokensModule } from 'src/tokens/tokens.module';
import { MailModule } from 'src/mail/mail.module';

import { UserService } from './user.service';

@Module({
  controllers: [],
  providers: [UserService, PrismaService, AuthService],
  imports: [TokensModule, MailModule],
  exports: [UserService],
})
export class UserModule {}
