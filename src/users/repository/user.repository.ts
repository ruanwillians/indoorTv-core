import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { User } from '../entities/user.entity';
import { UserRepositoryInterface } from './user.repository.interface';
import { Company } from 'src/companies/entities/company.entity';
import { Permission } from '@prisma/client';
import { ListUserDto } from '../dto/ListUserDto';
import * as bcrypt from 'bcrypt';
import { EncryptionService } from '../../@shared/cryptography/cryptography';
import { UpdateUserDto } from '../dto/updateUser.dto';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async createWithCompanyAccess(
    user: User,
    company: Company,
    role: Permission,
  ): Promise<ListUserDto> {
    const hashedPassword = await this.encryptionService.hashPassword(
      user.password,
    );

    return await this.prismaService.$transaction(async (prisma) => {
      const createdUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          document: user.document,
          isActive: user.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await prisma.companyAccess.create({
        data: {
          userId: createdUser.id,
          companyId: company.id,
          role,
        },
      });

      return new User(
        createdUser.id,
        createdUser.name,
        createdUser.email,
        hashedPassword,
        createdUser.document,
        [company],
      ).toObject();
    });
  }

  async create(user: User): Promise<ListUserDto> {
    const hashedPassword = await this.encryptionService.hashPassword(
      user.password,
    );

    return this.prismaService.$transaction(async (prisma) => {
      const createdUser = await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
          isActive: user.isActive,
          document: user.document,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return new User(
        createdUser.id,
        createdUser.name,
        createdUser.email,
        hashedPassword,
        createdUser.document,
      ).toObject();
    });
  }

  async findAll(page?: number, limit?: number): Promise<ListUserDto[]> {
    const skip = page && page > 1 ? (page - 1) * limit : 0;

    const users = await this.prismaService.user.findMany({
      skip,
      take: limit,
    });

    return users.map((user) => {
      return new User(
        user.id,
        user.name,
        user.email,
        user.password,
        user.document,
      ).toObject();
    });
  }

  async findById(id: string): Promise<ListUserDto | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (user) {
      return new User(
        user.id,
        user.name,
        user.email,
        user.password,
        user.document,
      ).toObject();
    }

    throw new NotFoundException('Usuário não encontrado');
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    return user
      ? new User(user.id, user.name, user.email, user.password, user.document)
      : null;
  }

  async update(id: string, user: UpdateUserDto): Promise<ListUserDto> {
    return this.prismaService.$transaction(async (prisma) => {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name: user.name,
          email: user.email,
          document: user.document,
          isActive: user.isActive,
          password: user.password,
        },
      });

      return new User(
        id,
        updatedUser.name,
        updatedUser.email,
        updatedUser.password,
        updatedUser.document,
      ).toObject();
    });
  }

  async updateCompanyAccess(
    user: User,
    companyId: string,
    role: Permission,
  ): Promise<ListUserDto> {
    const existingAccess = await this.prismaService.companyAccess.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId,
        },
      },
    });

    if (!existingAccess) {
      throw new NotFoundException(
        'Access not found for the specified user and company',
      );
    }

    const updatedAccess = await this.prismaService.companyAccess.update({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId,
        },
      },
      data: {
        role,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      document: user.document,
      companies: user.companies,
      isActive: user.isActive,
    };
  }
}
