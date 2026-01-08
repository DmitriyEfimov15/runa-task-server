import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailService } from './mail.service';
import { ProductionMailService } from './production.service';
import { SmtpMailService } from './smtp.service';
import { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from 'src/constants/env';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: SMTP_HOST,
          port: Number(SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD,
          },
        },
        defaults: {
          from: `"Dev Mail" <${SMTP_USER}>`,
        },
      }),
    }),
  ],
  providers: [MailService, ProductionMailService, SmtpMailService],
  exports: [MailService],
})
export class MailModule {}
