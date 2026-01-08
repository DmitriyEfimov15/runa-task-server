import { Injectable } from '@nestjs/common';
import { TSendMailOptions } from 'src/types/mail.types';

import { SmtpMailService } from './smtp.service';
import { ProductionMailService } from './production.service';
import { NODE_ENV } from 'src/constants/env';

@Injectable()
export class MailService {
  constructor(
    private readonly smtpService: SmtpMailService,
    private readonly productionService: ProductionMailService,
  ) {}

  async send(options: TSendMailOptions) {
    if (NODE_ENV === 'production') {
      return this.productionService.send(options);
    }

    // dev / test
    return this.smtpService.send(options);
  }

  async sendConfirmEmail(email: string, code: number) {
    return this.send({
      to: email,
      subject: 'Подтверждение регистрации',
      html: `
        <h2>Подтверждение почты</h2>
        <p>Код:</p>
        <h1>${code}</h1>
      `,
    });
  }

  async sendChangePasswordEmail(email: string, link: string) {
    return this.send({
      to: email,
      subject: 'Смена пароля',
      html: `
        <h2>Смена пароля</h2>
        <a href="${link}">${link}</a>
      `,
    });
  }

  async sendChangeMailEmail(email: string, code: string) {
    return this.send({
      to: email,
      subject: 'Смена пароля',
       html: `
        <h2>Подтверждение смены почтв</h2>
        <p>Код:</p>
        <h1>${code}</h1>
      `,
    });
  }
}
