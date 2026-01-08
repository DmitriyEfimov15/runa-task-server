import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';
import 'dotenv/config';
import { DATABASE_URL } from './constants/env';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: DATABASE_URL as string,
    });
    super({ adapter });
  }
}
