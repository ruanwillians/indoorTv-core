import {
  ConflictException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from './repository/user.repository';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from './entities/user.entity';
import UserFactory from './factory/user.factory';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    } as unknown as UserRepository;

    usersService = new UsersService(userRepository);
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      document: '42356886598',
    };

    const user = UserFactory.create(createUserDto);

    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(userRepository, 'create').mockResolvedValue(user);

    const result = await usersService.createUser(createUserDto);

    expect(result).toEqual({
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: user,
    });
    expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        document: createUserDto.document,
      }),
    );
  });

  it('should throw a conflict exception if email already exists', async () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      document: '42356886598',
    };

    const user = UserFactory.create(createUserDto);
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);

    await expect(usersService.createUser(createUserDto)).rejects.toThrow(
      new ConflictException('Email já está em uso'),
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
  });

  it('should find all users', async () => {
    const usersResponse: User[] = [
      new User(
        '1',
        'John Doe',
        'john@example.com',
        'password123',
        '42356886598',
        [],
        true,
      ),
      new User(
        '2',
        'Jane Doe',
        'jane@example.com',
        'password456',
        '12345678901',
        [],
        true,
      ),
    ];

    jest.spyOn(userRepository, 'findAll').mockResolvedValue(usersResponse);

    const result = await usersService.findAll();

    expect(result).toEqual({
      statusCode: HttpStatus.OK,
      data: usersResponse,
    });
    expect(userRepository.findAll).toHaveBeenCalled();
  });

  it('should find one user by id', async () => {
    const userId = '1';
    const userResponse: User = new User(
      userId,
      'John Doe',
      'john@example.com',
      'password123',
      '42356886598',
      [],
      true,
    );

    jest.spyOn(userRepository, 'findById').mockResolvedValue(userResponse);

    const result = await usersService.findOne(userId);

    expect(result).toEqual({
      statusCode: HttpStatus.OK,
      data: userResponse,
    });
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should throw an error if user not found', async () => {
    const userId = '1';

    jest
      .spyOn(userRepository, 'findById')
      .mockRejectedValue(new NotFoundException('Usuário não encontrado'));

    await expect(usersService.findOne(userId)).rejects.toThrow(
      new NotFoundException('Usuário não encontrado'),
    );
  });
});
