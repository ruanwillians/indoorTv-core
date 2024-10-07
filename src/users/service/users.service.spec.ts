import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from '../repositories/user.repository';
import { ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should throw ConflictException if email is already in use', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        document: '12345678901',
        isActive: true,
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678901',
        isActive: true,
      });

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        new ConflictException('Email já em uso'),
      );
    });

    it('should create a new user if email is not in use', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        document: '12345678901',
        isActive: true,
      };

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);

      jest.spyOn(userRepository, 'create').mockResolvedValueOnce({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678901',
        isActive: true,
      });

      const result = await service.createUser(createUserDto);

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678901',
        isActive: true,
      });
    });
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
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          document: '09876543210',
          isActive: false,
        },
      ];

      jest.spyOn(userRepository, 'findAll').mockResolvedValueOnce(users);

      const result = await service.findAll(1, 10);

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
          document: '09876543210',
          isActive: false,
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        document: '12345678901',
        isActive: true,
      };

      jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
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
      };

      jest.spyOn(userRepository, 'update').mockResolvedValueOnce(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove the user by id', async () => {
      jest.spyOn(userRepository, 'remove').mockResolvedValueOnce(undefined);

      const result = await service.remove('1');

      expect(result).toBeUndefined();
      expect(userRepository.remove).toHaveBeenCalledWith('1');
    });
  });
});
