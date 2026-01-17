import { Module } from '@nestjs/common';
import { ClearUnverifiedUsersCron } from './clear-unverified-users.cron';

@Module({
  providers: [ClearUnverifiedUsersCron],
})
export class CronModule {}
