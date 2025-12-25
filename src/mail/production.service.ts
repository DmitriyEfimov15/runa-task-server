import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { TSendMailOptions } from 'src/types/mail.types';

@Injectable()
export class ProductionMailService {
  private readonly apiKey = process.env.UNISENDER_API_KEY;
  private readonly lang = process.env.UNISENDER_LANG || 'ru';
  private readonly fromEmail = process.env.UNISENDER_FROM_EMAIL;
  private readonly fromName = process.env.UNISENDER_FROM_NAME;

  private get baseUrl() {
    return `https://api.unisender.com/${this.lang}/api`;
  }

  async send({ to, subject, html }: TSendMailOptions) {
    const { data } = await axios.post(`${this.baseUrl}/sendEmail`, null, {
      params: {
        format: 'json',
        api_key: this.apiKey,
        email: to,
        sender_email: this.fromEmail,
        sender_name: this.fromName,
        subject,
        body: html,
      },
    });

    if (data.error) {
      throw new InternalServerErrorException(data.error);
    }

    return data;
  }
}
