import { Module } from '@nestjs/common';
import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';
import { UserRepository } from './repositories/user.repository';
import { EncryptionService } from '../@shared/cryptography/cryptograpy';
import { PrismaService } from '../infra/database/prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository, EncryptionService, PrismaService],
})
export class UsersModule {}
