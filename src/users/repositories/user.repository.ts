import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { UserRepositoryInterface } from './user.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { EncryptionService } from '../../@shared/cryptography/cryptograpy';
import { ListUserDto } from '../dto/list.user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async findAll(page?: number, limit?: number): Promise<ListUserDto[]> {
    const pageNumber = page ? page : 1;
    const limitNumber = limit ? limit : 10;

    const users = await this.prismaService.user.findMany({
      take: limitNumber,
      skip: (pageNumber - 1) * limitNumber,
      orderBy: { createdAt: 'desc' },
    });

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

  async create(user: CreateUserDto): Promise<ListUserDto> {
    const hashedPassword = await this.encryptionService.hashPassword(
      user.password,
    );

    return this.prismaService.$transaction(async (prisma) => {
      const createdUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          isActive: user.isActive,
          document: user.document,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        document: createdUser.document,
        isActive: createdUser.isActive,
      };
    });
  }

  async findById(id: string): Promise<ListUserDto | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      document: user.document,
      isActive: user.isActive,
    };
  }

  async findByEmail(email: string): Promise<ListUserDto | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      document: user.document,
      isActive: user.isActive,
    };
  }

  async update(id: string, user: UpdateUserDto): Promise<ListUserDto> {
    return this.prismaService.$transaction(async (prisma) => {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          document: user.document,
          updatedAt: new Date(),
        },
      });

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        document: updatedUser.document,
        isActive: updatedUser.isActive,
      };
    });
  }

  async remove(id: string): Promise<void> {
    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
