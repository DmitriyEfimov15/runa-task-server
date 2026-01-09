import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { SendRequestToChangePasswordDto } from './dto/sendRequestToChangePassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshTokens: jest.fn(),
            verifyEmail: jest.fn(),
            sendRequestTochangePassword: jest.fn(),
            changePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = new RegisterDto();
      dto.email = 'test@test.com';
      dto.password = '123456';

      await controller.register(dto);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto = new LoginDto();
      dto.email = 'test@test.com';
      dto.password = '123456';

      const req = {} as any;
      const res = { json: jest.fn() } as any;

      await controller.login(dto, req, res);
      expect(authService.login).toHaveBeenCalledWith(dto, req, res);
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      const req = {} as any;
      const res = {} as any;

      await controller.logout(req, res);
      expect(authService.logout).toHaveBeenCalledWith(req, res);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshTokens', async () => {
      const req = {} as any;
      const res = {} as any;

      await controller.refresh(req, res);
      expect(authService.refreshTokens).toHaveBeenCalledWith(req, res);
    });
  });

  describe('verifyEmail', () => {
    it('should call authService.verifyEmail', async () => {
      const dto = new VerifyEmailDto();
      dto.activationCode = 123456;
      dto.activationLink = 'link';

      const req = {} as any;
      const res = { json: jest.fn() } as any;

      await controller.verifyEmail(dto, req, res);
      expect(authService.verifyEmail).toHaveBeenCalledWith(dto, req, res);
    });
  });

  describe('sendChangePasswordRequest', () => {
    it('should call authService.sendRequestTochangePassword', async () => {
      const dto = new SendRequestToChangePasswordDto();
      dto.email = 'test@test.com';

      await controller.sendChangePasswordRequest(dto);
      expect(authService.sendRequestTochangePassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword', async () => {
      const dto = new ChangePasswordDto();
      dto.newPassword = 'newpass';

      await controller.changePassword(dto);
      expect(authService.changePassword).toHaveBeenCalledWith('token123', dto);
    });
  });
});
