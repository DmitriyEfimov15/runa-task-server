import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';

import { UserService } from './user.service';
import type { CreateUserDto } from './dto/createUser.dto';

describe('UserService', () => {
  let service: UserService;
  let prisma: typeof mockPrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      email: 'dima@example.com',
      password: '123456',
      activationLink: '123',
      activationCode: 123456,
    };

    const createdUser = { id: '1', ...dto };
    prisma.user.create.mockResolvedValue(createdUser);

    const result = await service.createUser(dto);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: dto,
    });
    expect(result).toEqual(createdUser);
  });

  it('should get a user by email', async () => {
    const email = 'dima@example.com';
    const user = { id: '1', email, password: '123456' };
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await service.getUserByEmail(email);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email },
    });
    expect(result).toEqual(user);
  });
});
