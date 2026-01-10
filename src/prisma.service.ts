import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import 'dotenv/config';
import { DATABASE_URL } from './constants/env';
import { PrismaClient } from 'prisma/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: DATABASE_URL as string,
    });
    super({ adapter });
  }
}
