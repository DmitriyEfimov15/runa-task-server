import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailService } from './mail.service';
import { ProductionMailService } from './production.service';
import { SmtpMailService } from './smtp.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        },
        defaults: {
          from: `"Dev Mail" <${process.env.SMTP_USER}>`,
        },
      }),
    }),
  ],
  providers: [MailService, ProductionMailService, SmtpMailService],
  exports: [MailService],
})
export class MailModule {}
