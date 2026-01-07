import { Module } from '@nestjs/common';
import { TokensModule } from 'src/tokens/tokens.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [TokensModule, UserService],
})
export class AuthModule {}
