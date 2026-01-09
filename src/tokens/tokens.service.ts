import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { Request, Response } from 'express';

import { CreateRefreshTokenDto } from './dto/createRefreshToken.dto';
import { ACCESS_SECRET_KEY, NODE_ENV, REFRESH_SECRET_KEY } from 'src/constants/env';

@Injectable()
export class TokensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private getDeviceInfo(req: Request): string {
    const userAgent = req.headers['user-agent'] as string | string[] | undefined;

    const device: string = Array.isArray(userAgent)
      ? userAgent[0]
      : (userAgent ?? 'Неизвестное устройство');

    return device;
  }

  // Маппинг пользователя в payload с ролями
  private mapUserToPayload(user: User & { roles?: { role: { name: string } }[] }) {
    const roles = user.roles?.map((r) => r.role.name) || [];
    return { id: user.id, roles };
  }

  // Генерация access и refresh токенов
  generateTokens(user: User & { roles?: { role: { name: string } }[] }) {
    const payload = this.mapUserToPayload(user);

    const accessToken = this.jwtService.sign(payload, {
      secret: ACCESS_SECRET_KEY,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: REFRESH_SECRET_KEY,
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  // Сохраняем refresh токен в базе
  async saveRefreshToken(dto: CreateRefreshTokenDto) {
    const { userId, device, token } = dto;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return this.prisma.refreshToken.upsert({
      where: {
        userId_deviceInfo: { userId, deviceInfo: device },
      },
      update: {
        token,
        expiresAt,
      },
      create: {
        userId,
        deviceInfo: device,
        token,
        expiresAt,
      },
    });
  }

  // Валидация токена (access или refresh)
  async validateToken(token: string, type: 'access' | 'refresh') {
    try {
      const secret = type === 'access' ? ACCESS_SECRET_KEY : REFRESH_SECRET_KEY;
      return this.jwtService.verify(token, { secret });
    } catch {
      throw new UnauthorizedException('Token is invalid');
    }
  }

  // Удаляем конкретный refresh токен
  async deleteRefreshToken(userId: string, req: Request) {
    const device = this.getDeviceInfo(req);
    return this.prisma.refreshToken.deleteMany({
      where: { userId, deviceInfo: device },
    });
  }

  // Удаляем все refresh токены пользователя
  async deleteAllUserTokens(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  // Получаем refresh токен по значению
  async findByToken(token: string) {
    return this.prisma.refreshToken.findFirst({ where: { token } });
  }

  /**
   * Генерирует токены для пользователя, сохраняет refreshToken в базе и выставляет куки
   */
  async setTokensForUser(
    user: User & { roles?: { role: { name: string } }[] },
    req: Request,
    res: Response,
  ) {
    const { accessToken, refreshToken } = this.generateTokens(user);
    const deviceInfo = this.getDeviceInfo(req);

    const refreshTokenDto: CreateRefreshTokenDto = {
      device: deviceInfo,
      token: refreshToken,
      userId: user.id,
    };

    await this.saveRefreshToken(refreshTokenDto);

    // Устанавливаем куки
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 минут
      path: '/',
    });

    return { accessToken, refreshToken };
  }
}
