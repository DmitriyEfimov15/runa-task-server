import { Module } from '@nestjs/common';
import { TokensModule } from 'src/tokens/tokens.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { S3Module } from 'src/s3/s3.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [TokensModule, UserService, S3Module],
})
export class AuthModule {}
