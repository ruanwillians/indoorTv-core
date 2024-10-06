import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import UserFactory from './factory/user.factory';
import { UserRepository } from './repository/user.repository';
import { ErrorHandler } from '../@shared/errors/handleHttpError';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userInput: CreateUserDto) {
    try {
      const user = UserFactory.create(userInput);

      const userExist = await this.userRepository.findByEmail(user.email);

      if (userExist) {
        throw new ConflictException('Email já está em uso');
      }

      const createdUser = await this.userRepository.create(user);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: createdUser,
      };
    } catch (error) {
      ErrorHandler.handle(error);
    }
  }

  async findAll(page?: number, limit?: number) {
    try {
      const users = await this.userRepository.findAll(page, limit);
      return {
        statusCode: HttpStatus.OK,
        data: users,
      };
    } catch (error) {
      ErrorHandler.handle(error);
      throw new Error('Erro ao buscar usuários');
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findById(id);
      return {
        statusCode: HttpStatus.OK,
        data: user,
      };
    } catch (error) {
      ErrorHandler.handle(error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.update(id, updateUserDto);
      return {
        statusCode: HttpStatus.OK,
        data: user,
      };
    } catch (error) {
      ErrorHandler.handle(error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
