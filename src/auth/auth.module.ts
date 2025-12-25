import { Module } from '@nestjs/common';
import { TokensModule } from 'src/tokens/tokens.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [TokensModule],
})
export class AuthModule {}
