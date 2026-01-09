import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { CreateUserDto } from './dto/createUser.dto';
import { TResquestWithTokens } from 'src/types/auth.types';
import { TokensService } from 'src/tokens/tokens.service';
import { User } from 'generated/prisma/client';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private tokensService: TokensService,
    private s3Service: S3Service,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: dto.password,
        activationCode: dto.activationCode,
        activationLink: dto.activationLink,
      },
    });
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async getUserByAccessToken(req: TResquestWithTokens): Promise<User> {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new HttpException('Нет access-токена', HttpStatus.UNAUTHORIZED);
    }

    let payload: { id: string };
    try {
      payload = await this.tokensService.validateToken(accessToken, 'access');
    } catch {
      throw new HttpException('Access-токен невалиден', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async updateAvatar(file: Express.Multer.File, req: TResquestWithTokens, res: Response) {
    const user = await this.getUserByAccessToken(req);

    const fileExt = file.originalname.split('.').pop();
    const key = `avatars/${user.id}-${uuidv4()}.${fileExt}`;

    await this.s3Service.upload(file.buffer, key, file.mimetype);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { avatar: key },
    });

    return res.json({
      statusCode: HttpStatus.OK,
      message: 'Аватар успешно изменен',
    });
  }
}
