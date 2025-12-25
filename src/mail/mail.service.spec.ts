import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { TSendMailOptions } from 'src/types/mail.types';

import { MailService } from './mail.service';
import { SmtpMailService } from './smtp.service';
import { ProductionMailService } from './production.service';

describe('MailService', () => {
  let service: MailService;
  let smtpMock: SmtpMailService;
  let prodMock: ProductionMailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: SmtpMailService,
          useValue: {
            send: jest.fn().mockResolvedValue('smtp sent'),
          },
        },
        {
          provide: ProductionMailService,
          useValue: {
            send: jest.fn().mockResolvedValue('prod sent'),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    smtpMock = module.get(SmtpMailService);
    prodMock = module.get(ProductionMailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call SmtpMailService.send in dev mode', async () => {
    process.env.NODE_ENV = 'development';

    const options: TSendMailOptions = {
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    };

    const result = await service.send(options);

    expect(smtpMock.send).toHaveBeenCalledWith(options);
    expect(result).toBe('smtp sent');
    expect(prodMock.send).not.toHaveBeenCalled();
  });

  it('should call ProductionMailService.send in production mode', async () => {
    process.env.NODE_ENV = 'production';

    const options: TSendMailOptions = {
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    };

    const result = await service.send(options);

    expect(prodMock.send).toHaveBeenCalledWith(options);
    expect(result).toBe('prod sent');
    expect(smtpMock.send).not.toHaveBeenCalled();
  });

  it('should send confirm email using send', async () => {
    process.env.NODE_ENV = 'development';
    const email = 'user@example.com';
    const code = 123456;

    await service.sendConfirmEmail(email, code);

    expect(smtpMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: 'Подтверждение регистрации',
        html: expect.stringContaining(`${code}`),
      }),
    );
  });

  it('should send change password email using send', async () => {
    process.env.NODE_ENV = 'development';
    const email = 'user@example.com';
    const link = 'https://example.com/reset';

    await service.sendChangePasswordEmail(email, link);

    expect(smtpMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: 'Смена пароля',
        html: expect.stringContaining(link),
      }),
    );
  });
});
