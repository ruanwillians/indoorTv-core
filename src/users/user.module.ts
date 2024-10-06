import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './user.controller';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { UserRepository } from './repository/user.repository';
import { ValidationEntityError } from 'src/@shared/errors/validationEntityErrors';
import { EncryptionService } from 'src/@shared/cryptography/cryptography';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    UserRepository,
    ValidationEntityError,
    EncryptionService,
  ],
})
export class UsersModule {}
