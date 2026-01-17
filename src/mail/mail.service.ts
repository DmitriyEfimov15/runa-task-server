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
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Inter,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="420" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;padding:32px;
                   box-shadow:0 10px 30px rgba(2,6,23,0.08);">
            
            <tr>
              <td style="text-align:center;">
                <h1 style="margin:0 0 12px;font-size:22px;color:#020617;">
                  Подтверждение почты
                </h1>
                <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
                  Введите код ниже, чтобы завершить регистрацию
                </p>
              </td>
            </tr>

            <tr>
              <td align="center">
                <div style="
                  font-size:32px;
                  font-weight:600;
                  letter-spacing:6px;
                  color:#0f172a;
                  padding:16px 24px;
                  border-radius:8px;
                  background:#f1f5f9;
                  display:inline-block;
                ">
                  ${code}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding-top:24px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">
                  Если вы не регистрировались — просто проигнорируйте это письмо
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
    });
  }

  async sendChangePasswordEmail(email: string, link: string) {
    return this.send({
      to: email,
      subject: 'Смена пароля',
      html: `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Inter,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="420" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;padding:32px;
                   box-shadow:0 10px 30px rgba(2,6,23,0.08);">

            <tr>
              <td>
                <h1 style="margin:0 0 12px;font-size:22px;color:#020617;">
                  Смена пароля
                </h1>
                <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
                  Нажмите кнопку ниже, чтобы задать новый пароль
                </p>
              </td>
            </tr>

            <tr>
              <td align="center">
                <a href="${link}"
                  style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#0f172a;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:8px;
                    font-size:14px;
                    font-weight:500;
                  ">
                  Сменить пароль
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding-top:24px;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">
                  Если кнопка не работает, скопируйте ссылку:
                </p>
                <p style="margin:8px 0 0;font-size:12px;word-break:break-all;">
                  <a href="${link}" style="color:#0f172a;">${link}</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
    });
  }

  async sendChangeMailEmail(email: string, code: string) {
    return this.send({
      to: email,
      subject: 'Подтверждение смены почты',
      html: `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Inter,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="420" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;padding:32px;
                   box-shadow:0 10px 30px rgba(2,6,23,0.08);">

            <tr>
              <td>
                <h1 style="margin:0 0 12px;font-size:22px;color:#020617;">
                  Смена почты
                </h1>
                <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
                  Подтвердите смену email, введя код ниже
                </p>
              </td>
            </tr>

            <tr>
              <td align="center">
                <div style="
                  font-size:28px;
                  font-weight:600;
                  letter-spacing:4px;
                  color:#0f172a;
                  padding:14px 20px;
                  border-radius:8px;
                  background:#f1f5f9;
                  display:inline-block;
                ">
                  ${code}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding-top:24px;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">
                  Если вы не меняли почту — ничего делать не нужно
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
    });
  }
}
