import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { User } from '../entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { Permission } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import UserFactory from '../factory/user.factory';
import { UpdateUserDto } from '../dto/updateUser.dto';
import { EncryptionService } from '../../@shared/cryptography/cryptography';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  companyAccess: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockEncryptionService = {
  hashPassword: jest.fn().mockResolvedValue('hashed_password'),
};

const mockUserData = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  isActive: true,
  document: '12345678901',
};

const createUserMock = () => {
  return UserFactory.create(mockUserData);
};

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EncryptionService,
          useValue: mockEncryptionService,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    const user = createUserMock();

    mockPrismaService.user.create.mockResolvedValue({
      id: user.id,
      name: user.name,
      email: user.email,
      password: 'hashed_password',
      isActive: user.isActive,
      document: user.document,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdUser = await userRepository.create(user);

    expect(createdUser).toBeDefined();
    expect(createdUser.name).toEqual(user.name);
    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: 'hashed_password',
        isActive: user.isActive,
        document: user.document,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    });
  });

  it('should find all users', async () => {
    const usersMockData = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        document: '12345678901',
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password456',
        document: '10987654321',
      },
    ];

    mockPrismaService.user.findMany.mockResolvedValue(usersMockData);

    const users = await userRepository.findAll();

    expect(users).toHaveLength(usersMockData.length);
    expect(users).toEqual(
      expect.arrayContaining(
        usersMockData.map((user) =>
          expect.objectContaining({
            id: user.id,
            name: user.name,
            email: user.email,
            document: user.document,
          }),
        ),
      ),
    );
    expect(mockPrismaService.user.findMany).toHaveBeenCalled();
  });

  describe('findAll', () => {
    it('should find all users with pagination', async () => {
      const usersMockData = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          document: '12345678901',
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password456',
          document: '10987654321',
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(usersMockData);

      const page = 1;
      const limit = 10;
      const users = await userRepository.findAll(page, limit);

      expect(users).toHaveLength(usersMockData.length);
      expect(users).toEqual(
        expect.arrayContaining(
          usersMockData.map((user) =>
            expect.objectContaining({
              id: user.id,
              name: user.name,
              email: user.email,
              document: user.document,
            }),
          ),
        ),
      );

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        skip: (page - 1) * limit,
        take: limit,
      });
    });
  });

  it('should find a user by ID', async () => {
    const userId = mockUserData.id;

    mockPrismaService.user.findUnique.mockResolvedValue({
      id: userId,
      name: mockUserData.name,
      email: mockUserData.email,
      password: mockUserData.password,
      isActive: mockUserData.isActive,
      document: mockUserData.document,
    });

    const user = await userRepository.findById(userId);

    expect(user).toBeDefined();
    expect(user.id).toEqual(userId);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
  });

  it('should throw an error if user is not found by ID', async () => {
    const userId = mockUserData.id;

    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(userRepository.findById(userId)).rejects.toThrow(
      new NotFoundException('Usuário não encontrado'),
    );
  });

  it('should find a user by email', async () => {
    const userEmail = mockUserData.email;

    mockPrismaService.user.findUnique.mockResolvedValue({
      id: mockUserData.id,
      name: mockUserData.name,
      email: userEmail,
      password: mockUserData.password,
      isActive: mockUserData.isActive,
      document: mockUserData.document,
    });

    const user = await userRepository.findByEmail(userEmail);

    expect(user).toBeDefined();
    expect(user.email).toEqual(userEmail);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: userEmail },
    });
  });

  it('should return null if user is not found by email', async () => {
    const userEmail = mockUserData.email;

    mockPrismaService.user.findUnique.mockResolvedValue(null);

    const user = await userRepository.findByEmail(userEmail);

    expect(user).toBeNull();
  });
  describe('updateCompanyAccess', () => {
    it('should update company access successfully', async () => {
      const user = createUserMock();
      const companyId = 'company-id';
      const newRole: Permission = 'ADMIN';

      mockPrismaService.companyAccess.findUnique.mockResolvedValue({
        userId: user.id,
        companyId,
        role: 'USER',
      });

      mockPrismaService.companyAccess.update.mockResolvedValue({
        userId: user.id,
        companyId,
        role: newRole,
      });

      const result = await userRepository.updateCompanyAccess(
        user,
        companyId,
        newRole,
      );

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        document: user.document,
        companies: user.companies,
        isActive: user.isActive,
      });
      expect(mockPrismaService.companyAccess.update).toHaveBeenCalledWith({
        where: {
          userId_companyId: {
            userId: user.id,
            companyId,
          },
        },
        data: { role: newRole },
      });
    });

    it('should throw an error if access not found', async () => {
      const user = createUserMock();
      const companyId = 'non-existing-company-id';
      const newRole: Permission = 'ADMIN';

      mockPrismaService.companyAccess.findUnique.mockResolvedValue(null);

      await expect(
        userRepository.updateCompanyAccess(user, companyId, newRole),
      ).rejects.toThrow(
        new NotFoundException(
          'Access not found for the specified user and company',
        ),
      );
    });
  });

  describe('update', () => {
    it('should update user details successfully', async () => {
      const user = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        document: '12345678901',
        isActive: true,
      };
      const updatedUserData = new UpdateUserDto({
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        document: '12345678901',
        isActive: true,
      });

      mockPrismaService.user.update.mockResolvedValue(updatedUserData);

      const result = await userRepository.update(user.id, user);

      expect(result).toEqual({
        name: updatedUserData.name,
        email: updatedUserData.email,
        document: updatedUserData.document,
        isActive: updatedUserData.isActive,
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          document: user.document,
          password: user.password,
        },
      });
    });

    it('should throw an error if user not found', async () => {
      const user = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        document: '12345678901',
        isActive: true,
      };
      mockPrismaService.user.update.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(userRepository.update(user.id, user)).rejects.toThrow(
        new Error('User not found'),
      );
    });
  });
});
