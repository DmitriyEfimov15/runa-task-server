import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from 'src/mail/mail.service';
import { TokensService } from 'src/tokens/tokens.service';
import { Request, Response } from 'express';
import { TResquestWithTokens } from 'src/types/auth.types';

import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { LoginDto } from './dto/login.dto';
import { SendRequestToChangePasswordDto } from './dto/sendRequestToChangePassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { RegisterDto } from './dto/register.dto';
import { valifyPassword } from 'src/validators/password';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
    private tokensService: TokensService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password } = dto;

    const isValidPassword = valifyPassword(password);

    if (!isValidPassword) {
      throw new HttpException(
        'Пароль не соответствует требованиям безопасности',
        HttpStatus.BAD_REQUEST,
      );
    }

    const candidate = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (candidate) {
      throw new HttpException('Пользователь с такой почтой уже существует', HttpStatus.CONFLICT);
    }

    const hashPassword = await bcrypt.hash(password, 7);
    const activationCode = Math.floor(100000 + Math.random() * 900000);
    const activationLink = uuidv4();

    await this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashPassword,
          activationCode,
          activationLink,
        },
      });

      const role = await tx.role.findUnique({
        where: { name: 'USER' },
      });

      if (!role) {
        throw new HttpException('Роль USER не найдена', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });
    });

    await this.mailService.sendConfirmEmail(email, activationCode);

    return {
      activationLink,
      statusCode: HttpStatus.CREATED,
    };
  }

  async verifyEmail(dto: VerifyEmailDto, req: Request, res: Response) {
    const { activationCode, activationLink } = dto;

    const user = await this.prismaService.user.findUnique({
      where: {
        activationLink,
      },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      throw new HttpException('Некорректная ссылка активации', HttpStatus.BAD_REQUEST);
    }

    if (user.isEmailVerified) {
      throw new HttpException('Почта уже подтверждена', HttpStatus.BAD_REQUEST);
    }

    if (user.activationCode !== Number(activationCode)) {
      throw new HttpException('Некорректный код активации', HttpStatus.BAD_REQUEST);
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        isEmailVerified: true,
        activationCode: null,
        activationLink: null,
      },
    });
    await this.tokensService.setTokensForUser(user, req, res);

    return res.json({
      user: {
        email: user.email,
        id: user.id,
      },
      statusCode: HttpStatus.OK,
    });
  }

  async login(loginDto: LoginDto, req: Request, res: Response) {
    const { email, password } = loginDto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Неверный пароль', HttpStatus.BAD_REQUEST);
    }

    await this.tokensService.setTokensForUser(user, req, res);

    return res.json({
      statusCode: HttpStatus.OK,
    });
  }

  async sendRequestTochangePassword(dto: SendRequestToChangePasswordDto) {
    const { email } = dto;
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // токен действителен 1 час
    await this.prismaService.resetPassword.create({
      data: { userId: user.id, resetToken: token, expiresAt },
    });
    const changeLink = `${process.env.CLIENT_URL}/auth/change-password/${token}`;

    await this.mailService.sendChangePasswordEmail(email, changeLink);

    return {
      message: 'Ссылка для смены пароля отправлена на вашу почту',
      statusCode: HttpStatus.OK,
    };
  }

  async changePassword(dto: ChangePasswordDto) {
    const { newPassword, resetToken } = dto;

    const isValidPassword = valifyPassword(newPassword);

    if (!isValidPassword) {
      throw new HttpException(
        'Пароль не соответствует требованиям безопасности',
        HttpStatus.BAD_REQUEST,
      );
    }

    const entry = await this.prismaService.resetPassword.findUnique({
      where: { resetToken },
      include: { user: true },
    });

    if (!entry) {
      throw new HttpException('Ссылка недействительна', HttpStatus.BAD_REQUEST);
    }

    if (entry.expiresAt < new Date()) {
      await this.prismaService.resetPassword.delete({
        where: { id: entry.id },
      });
      throw new HttpException('Ссылка устарела', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 7);

    await this.prismaService.user.update({
      where: { id: entry.userId },
      data: { password: hashedPassword },
    });

    await this.prismaService.resetPassword.delete({
      where: { id: entry.id },
    });

    return { statusCode: HttpStatus.OK, message: 'Пароль успешно изменён' };
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new HttpException('Нет токена', HttpStatus.BAD_REQUEST);
    }

    const tokenData = await this.tokensService.findByToken(refreshToken);

    if (!tokenData) {
      throw new HttpException('Неверный токен', HttpStatus.UNAUTHORIZED);
    }

    await this.tokensService.deleteRefreshToken(tokenData.userId, req);

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');

    return res.json({
      statusCode: HttpStatus.OK,
    });
  }

  async refreshTokens(req: TResquestWithTokens, res: Response) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new HttpException('Нет refresh-токена', HttpStatus.UNAUTHORIZED);
    }

    let payload: { id: string };
    try {
      payload = await this.tokensService.validateToken(refreshToken, 'refresh');
    } catch {
      throw new HttpException('Refresh-токен невалиден', HttpStatus.UNAUTHORIZED);
    }

    const tokenData = await this.tokensService.findByToken(refreshToken);

    if (!tokenData) {
      await this.tokensService.deleteAllUserTokens(payload.id);

      throw new HttpException('Сессия скомпрометирована. Войдите заново', HttpStatus.UNAUTHORIZED);
    }

    if (tokenData.expiresAt < new Date()) {
      await this.tokensService.deleteAllUserTokens(tokenData.userId);
      throw new HttpException('Refresh-токен истёк', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: tokenData.userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    const tokens = await this.tokensService.setTokensForUser(user, req, res);

    return res.json({
      statusCode: HttpStatus.OK,
    });
  }

  async getProfile(req: TResquestWithTokens, res: Response) {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new HttpException('Нет access-токена', HttpStatus.UNAUTHORIZED);
    }

    let payload: { id: string };
    try {
      payload = await this.tokensService.validateToken(accessToken, 'access');
    } catch {
      throw new HttpException('Access-токен невалиден', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    return res.json({
      statusCode: HttpStatus.OK,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  }
}
