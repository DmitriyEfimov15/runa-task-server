import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from 'src/constants/env';

@Injectable()
export class InitialSeed {
  constructor(private readonly prisma: PrismaService) {}

  async createInitialData() {
    const roles = ['ADMIN', 'USER'];

    for (const roleName of roles) {
      await this.prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      });
    }
    console.log('Роли созданы');

    const defaultEmail = DEFAULT_ADMIN_EMAIL;
    const defaultPassword = DEFAULT_ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 7);

    if (!defaultEmail) {
      throw new Error('DEFAULT_ADMIN_EMAIL должен быть задан в .env');
    }

    const user = await this.prisma.user.upsert({
      where: { email: defaultEmail },
      update: {},
      create: {
        email: defaultEmail,
        password: hashedPassword,
        isEmailVerified: true,
      },
    });
    console.log('Пользователь создан:', user.email);

    const userRole = await this.prisma.role.findUnique({
      where: { name: 'ADMIN' },
    });
    if (userRole) {
      await this.prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: userRole.id } },
        update: {},
        create: { userId: user.id, roleId: userRole.id },
      });
      console.log('Роль ADMIN присвоена пользователю');
    }
  }
}
