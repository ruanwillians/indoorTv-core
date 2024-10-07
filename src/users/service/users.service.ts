import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { ListUserDto } from '../dto/list.user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userData: CreateUserDto): Promise<ListUserDto> {
    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) throw new ConflictException('Email já em uso');

    const user = await this.userRepository.create(userData);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      document: user.document,
      isActive: user.isActive,
    };
  }

  async findAll(page?: number, limit?: number) {
    const users = await this.userRepository.findAll(page, limit);

    return users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        document: user.document,
        isActive: user.isActive,
      };
    });
  }

  findOne(id: string) {
    return this.userRepository.findById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  remove(id: string) {
    return this.userRepository.remove(id);
  }
}
