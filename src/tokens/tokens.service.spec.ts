import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';

import { TokensService } from './tokens.service';

describe('TokensService', () => {
  let service: TokensService;

  const prismaMock = {
    refreshToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const jwtServiceMock = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeAll(() => {
    process.env.ACCESS_SECRET_KEY = 'access-secret';
    process.env.REFRESH_SECRET_KEY = 'refresh-secret';
    process.env.NODE_ENV = 'test';
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      jwtServiceMock.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const user: any = {
        id: 'user-1',
        roles: [{ role: { name: 'ADMIN' } }],
      };

      const result = service.generateTokens(user);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(jwtServiceMock.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('saveRefreshToken', () => {
    it('should update existing refresh token for device', async () => {
      prismaMock.refreshToken.findFirst.mockResolvedValue({
        id: 'token-id',
      });

      prismaMock.refreshToken.update.mockResolvedValue({ id: 'token-id' });

      const result = await service.saveRefreshToken({
        userId: 'user-1',
        device: 'Chrome',
        token: 'refresh-token',
      });

      expect(prismaMock.refreshToken.update).toHaveBeenCalled();
      expect(result).toEqual({ id: 'token-id' });
    });

    it('should create new refresh token if not exists', async () => {
      prismaMock.refreshToken.findFirst.mockResolvedValue(null);
      prismaMock.refreshToken.create.mockResolvedValue({ id: 'new-id' });

      const result = await service.saveRefreshToken({
        userId: 'user-1',
        device: 'Chrome',
        token: 'refresh-token',
      });

      expect(prismaMock.refreshToken.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 'new-id' });
    });
  });

  describe('validateToken', () => {
    it('should return payload if token is valid', async () => {
      jwtServiceMock.verify.mockReturnValue({ id: 'user-1' });

      const result = await service.validateToken('token', 'access');

      expect(result).toEqual({ id: 'user-1' });
    });

    it('should throw UnauthorizedException if token invalid', async () => {
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error();
      });

      await expect(service.validateToken('bad-token', 'access')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token for device', async () => {
      const req = {
        headers: { 'user-agent': 'Chrome' },
      } as Request;

      prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.deleteRefreshToken('user-1', req);

      expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', deviceInfo: 'Chrome' },
      });

      expect(result).toEqual({ count: 1 });
    });
  });

  describe('deleteAllUserTokens', () => {
    it('should delete all user refresh tokens', async () => {
      prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.deleteAllUserTokens('user-1');

      expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });

      expect(result).toEqual({ count: 3 });
    });
  });

  describe('findByToken', () => {
    it('should find refresh token by value', async () => {
      prismaMock.refreshToken.findFirst.mockResolvedValue({
        token: 'refresh-token',
      });

      const result = await service.findByToken('refresh-token');

      expect(result).toEqual({ token: 'refresh-token' });
    });
  });

  describe('setTokensForUser', () => {
    it('should generate tokens, save refresh token and set cookies', async () => {
      jest.spyOn(service, 'generateTokens').mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      prismaMock.refreshToken.findFirst.mockResolvedValue(null);
      prismaMock.refreshToken.create.mockResolvedValue({});

      const req = {
        headers: { 'user-agent': 'Chrome' },
      } as Request;

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const user: any = { id: 'user-1', roles: [] };

      const result = await service.setTokensForUser(user, req, res);

      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });
});
