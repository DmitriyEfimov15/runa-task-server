import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { TokensService } from 'src/tokens/tokens.service';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let mailService: MailService;
  let tokensService: TokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            userRole: {
              create: jest.fn(),
            },
            role: {
              findUnique: jest.fn(),
            },
            resetPassword: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(
              async (
                cb: (tx: {
                  user: { create: jest.Mock };
                  userRole: { create: jest.Mock };
                  role: { findUnique: jest.Mock };
                }) => any,
              ) => {
                return cb({
                  user: {
                    create: jest.fn(),
                  },
                  userRole: {
                    create: jest.fn(),
                  },
                  role: {
                    findUnique: jest.fn(),
                  },
                });
              },
            ),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendConfirmEmail: jest.fn(),
            sendChangePasswordEmail: jest.fn(),
          },
        },
        {
          provide: TokensService,
          useValue: {
            setTokensForUser: jest.fn(),
            findByToken: jest.fn(),
            deleteRefreshToken: jest.fn(),
            deleteAllUserTokens: jest.fn(),
            validateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
    tokensService = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw if user already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: '1' });

      const dto = new RegisterDto();
      dto.email = 'test@test.com';
      dto.password = '123456';

      await expect(service.register(dto)).rejects.toThrow(HttpException);
    });

    it('should register a new user and call mailService.sendConfirmEmail', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      // Мокаем $transaction и роли внутри него
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (
          cb: (tx: {
            user: { create: jest.Mock };
            userRole: { create: jest.Mock };
            role: { findUnique: jest.Mock };
          }) => any,
        ) => {
          return cb({
            user: {
              create: jest.fn().mockResolvedValue({
                id: 'user1',
                email: 'test@test.com',
                roles: [],
              }),
            },
            userRole: { create: jest.fn() },
            role: {
              findUnique: jest.fn().mockResolvedValue({ id: 'role1', name: 'USER' }),
            },
          });
        },
      );

      const dto = new RegisterDto();
      dto.email = 'test@test.com';
      dto.password = '123456';

      const result = await service.register(dto);

      expect(mailService.sendConfirmEmail).toHaveBeenCalledWith(
        'test@test.com',
        expect.any(Number),
      );

      expect(result).toHaveProperty('activationLink');
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const dto = new LoginDto();
      dto.email = 'test@test.com';
      dto.password = '123456';

      await expect(service.login(dto, {} as any, {} as any)).rejects.toThrow(HttpException);
    });

    it('should throw if password invalid', async () => {
      const hashed = await bcrypt.hash('123456', 7);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        password: hashed,
        roles: [],
      });

      const dto = new LoginDto();
      dto.email = 'test@test.com';
      dto.password = 'wrongpass';

      await expect(service.login(dto, {} as any, {} as any)).rejects.toThrow(HttpException);
    });

    it('should login successfully and call tokensService.setTokensForUser', async () => {
      const hashed = await bcrypt.hash('123456', 7);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        password: hashed,
        roles: [],
      });

      const dto = new LoginDto();
      dto.email = 'test@test.com';
      dto.password = '123456';

      const req = {} as any;
      const res = { json: jest.fn() } as any;

      await service.login(dto, req, res);

      expect(tokensService.setTokensForUser).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Успешный вход' }));
    });
  });

  describe('sendRequestTochangePassword', () => {
    it('should throw if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.sendRequestTochangePassword({ email: 'test@test.com' })).rejects.toThrow(
        HttpException,
      );
    });

    it('should create reset token and call mailService.sendChangePasswordEmail', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

      await service.sendRequestTochangePassword({ email: 'test@test.com' });

      expect(prisma.resetPassword.create).toHaveBeenCalled();
      expect(mailService.sendChangePasswordEmail).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should throw if reset token not found', async () => {
      (prisma.resetPassword.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.changePassword('token', { newPassword: '123' })).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw if token expired', async () => {
      (prisma.resetPassword.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        expiresAt: new Date(Date.now() - 1000),
        userId: '1',
      });

      await expect(service.changePassword('token', { newPassword: '123' })).rejects.toThrow(
        HttpException,
      );
    });

    it('should hash password, update user and delete token', async () => {
      (prisma.resetPassword.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        expiresAt: new Date(Date.now() + 1000),
        userId: '1',
      });

      await service.changePassword('token', { newPassword: '123456' });

      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.resetPassword.delete).toHaveBeenCalled();
    });
  });
});
