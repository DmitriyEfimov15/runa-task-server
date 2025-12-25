// jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthToken } from 'src/types/auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const accessToken = request.cookies[AuthToken.ACCESS_TOKEN];

    if (!accessToken) {
      throw new UnauthorizedException('Access token отсутствует');
    }

    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.ACCESS_SECRET_KEY,
      });

      request.user = payload;

      return true;
    } catch (err) {
      throw new UnauthorizedException('Access token невалиден или просрочен');
    }
  }
}
