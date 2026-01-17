import { Module, OnModuleInit } from '@nestjs/common';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { TokensService } from 'src/tokens/tokens.service';
import { SmtpMailService } from 'src/mail/smtp.service';
import { ProductionMailService } from 'src/mail/production.service';

import { UserModule } from '../user/user.module';

import { AppController } from './app.controller';
import { InitialSeed } from './initialSeed';
import { S3Service } from 'src/s3/s3.service';
import { ConfigModule } from '@nestjs/config';
import { NODE_ENV } from 'src/constants/env';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: NODE_ENV === 'production' ? '.env.production.local' : '.env.development.local',
    }),
    ScheduleModule.forRoot(),
    UserModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AuthService,
    PrismaService,
    UserService,
    MailService,
    TokensService,
    SmtpMailService,
    ProductionMailService,
    InitialSeed,
    S3Service,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly initialSeed: InitialSeed) {}

  async onModuleInit() {
    await this.initialSeed.createInitialData();
  }
}
