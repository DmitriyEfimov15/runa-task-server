import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend, type CreateEmailResponse } from 'resend';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from 'src/constants/env';
import { TSendMailOptions } from 'src/types/mail.types';

@Injectable()
export class ProductionMailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined');
    }

    if (!RESEND_FROM_EMAIL) {
      throw new Error('RESEND_FROM_EMAIL is not defined');
    }

    this.resend = new Resend(RESEND_API_KEY);
    this.from = RESEND_FROM_EMAIL;
  }

  async send({ to, subject, html }: TSendMailOptions): Promise<CreateEmailResponse['data']> {
    const response = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });

    if (response.error) {
      throw new InternalServerErrorException(response.error.message);
    }

    return response.data;
  }
}
