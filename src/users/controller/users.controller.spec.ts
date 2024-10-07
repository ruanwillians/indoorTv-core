import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { EncryptionService } from '../../@shared/cryptography/cryptograpy';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: PrismaService;
  let encryptionService: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest
              .fn()
              .mockImplementation((cb) => cb(prismaService)),
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const users = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          document: '12345678901',
          isActive: true,
          password: 'hashedPassword',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          document: '987654321',
          isActive: false,
          password: 'hashedPassword',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(prismaService.user, 'findMany').mockResolvedValueOnce(users);

      const result = await repository.findAll(1, 10);

      expect(result).toEqual([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          document: '12345678901',
          isActive: true,
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          document: '987654321',
          isActive: false,
        },
      ]);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        document: '12345678901',
        isActive: true,
      };

      const hashedPassword = 'hashedPassword';
      const createdUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678901',
        isActive: true,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(encryptionService, 'hashPassword')
        .mockResolvedValueOnce(hashedPassword);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValueOnce(createdUser);

      const result = await repository.create(createUserDto);

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678901',
        isActive: true,
      });
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const user = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678901',
        isActive: true,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(user);

      const result = await repository.findById('1');

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678901',
        isActive: true,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(repository.findById('1')).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678901',
        isActive: true,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(user);

      const result = await repository.findByEmail('john@example.com');

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678901',
        isActive: true,
      });
    });

    it('should return null if user is not found by email', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      const result = await repository.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
        isActive: false,
      };

      const updatedUser = {
        id: '1',
        name: 'Updated Name',
        email: 'updated@example.com',
        document: '12345678901',
        isActive: false,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce(updatedUser);

      const result = await repository.update('1', updateUserDto);

      expect(result).toEqual({
        id: '1',
        name: 'Updated Name',
        email: 'updated@example.com',
        document: '12345678901',
        isActive: false,
      });
    });
  });

  describe('remove', () => {
    it('should delete a user by id', async () => {
      jest.spyOn(prismaService.user, 'delete').mockResolvedValueOnce(undefined);

      await repository.remove('1');

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
