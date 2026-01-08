import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_SECRET_KEY } from 'src/constants/env';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = ACCESS_SECRET_KEY;

    if (!secret) {
      throw new HttpException('Секретный ключ не найден', HttpStatus.BAD_REQUEST);
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  validate(payload: { id: string; roles: string[] }) {
    return { id: payload.id, roles: payload.roles };
  }
}
