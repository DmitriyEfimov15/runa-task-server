import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';

import { TokensService } from './tokens.service';

@Module({
  imports: [JwtModule.register({ global: true })],
  providers: [TokensService, PrismaService],
  exports: [TokensService],
})
export class TokensModule {}
