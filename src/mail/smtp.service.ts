import { Injectable } from '@nestjs/common';
import { TSendMailOptions } from 'src/types/mail.types';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SmtpMailService {
  constructor(private readonly mailer: MailerService) {}

  async send({ to, subject, html }: TSendMailOptions) {
    return this.mailer.sendMail({
      to,
      subject,
      html,
    });
  }
}
