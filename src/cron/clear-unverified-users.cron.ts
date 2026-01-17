// src/cron/clear-unverified-users.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ClearUnverifiedUsersCron {
  private readonly logger = new Logger(ClearUnverifiedUsersCron.name);

  constructor(private readonly prisma: PrismaService) {}

  // Каждый день в 03:00
  @Cron('0 3 * * *')
  async handle() {
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() - 24);

    const { count } = await this.prisma.user.deleteMany({
      where: {
        isEmailVerified: false,
        createdAt: {
          lt: expireDate,
        },
      },
    });

    if (count > 0) {
      this.logger.log(`Удалено неподтверждённых пользователей: ${count}`);
    }
  }
}
