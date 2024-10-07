import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { EncryptionService } from '../../@shared/cryptography/cryptograpy';
import { NotFoundException } from '@nestjs/common';
import { ListUserDto } from '../dto/list.user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let prismaService: PrismaService;
  let encryptionService: EncryptionService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockEncryptionService = {
    hashPassword: jest.fn((password: string) =>
      Promise.resolve(`hashed-${password}`),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EncryptionService, useValue: mockEncryptionService },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          document: '123456',
          isActive: true,
          password: 'password',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'User 2',
          email: 'user2@example.com',
          document: '654321',
          isActive: true,
          password: 'password',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      const result: ListUserDto[] = await userRepository.findAll();

      expect(result).toEqual([
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          document: '123456',
          isActive: true,
        },
        {
          id: '2',
          name: 'User 2',
          email: 'user2@example.com',
          document: '654321',
          isActive: true,
        },
      ]);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userData: CreateUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password',
        document: '654321',
        isActive: true,
      };

      const mockCreatedUser = {
        id: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...userData,
      };

      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation(async (callback) => {
          return callback(prismaService);
        });

      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(mockCreatedUser);

      const result = await userRepository.create(userData);

      expect(result).toEqual({
        id: mockCreatedUser.id,
        name: mockCreatedUser.name,
        email: mockCreatedUser.email,
        document: mockCreatedUser.document,
        isActive: mockCreatedUser.isActive,
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: expect.any(String),
          isActive: userData.isActive,
          document: userData.document,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const mockUser = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        document: '123456',
        isActive: true,
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await userRepository.findById('1');

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        document: mockUser.document,
        isActive: mockUser.isActive,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(userRepository.findById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        document: '123456',
        isActive: true,
        password: 'password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('user1@example.com');

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        document: mockUser.document,
        isActive: mockUser.isActive,
      });
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      const result = await userRepository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userData: UpdateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
        document: '123456',
        isActive: true,
        password: 'password',
      };

      const mockUpdatedUser = {
        id: '1',
        name: userData.name,
        email: userData.email,
        document: userData.document,
        isActive: userData.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(encryptionService, 'hashPassword')
        .mockResolvedValue(`hashed-${userData.password}`);

      jest
        .spyOn(mockPrismaService.user, 'update')
        .mockResolvedValue(mockUpdatedUser);

      jest
        .spyOn(mockPrismaService, '$transaction')
        .mockImplementation(async (callback) => {
          return callback(mockPrismaService);
        });

      const result = await userRepository.update('1', userData);

      expect(result).toEqual({
        id: mockUpdatedUser.id,
        name: mockUpdatedUser.name,
        email: mockUpdatedUser.email,
        document: mockUpdatedUser.document,
        isActive: mockUpdatedUser.isActive,
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: userData.name,
          email: userData.email,
          isActive: userData.isActive,
          document: userData.document,
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(prismaService.user, 'delete').mockResolvedValue(undefined);

      await userRepository.remove('1');

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
