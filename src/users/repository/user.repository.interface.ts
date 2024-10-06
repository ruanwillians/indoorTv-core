import { Permission } from '@prisma/client';
import { Company } from '../..//companies/entities/company.entity';
import { User } from '../entities/user.entity';
import { ListUserDto } from '../dto/ListUserDto';
import { UpdateUserDto } from '../dto/updateUser.dto';

export interface UserRepositoryInterface {
  create(user: User): Promise<ListUserDto>;
  createWithCompanyAccess(
    user: User,
    company: Company,
    role: Permission,
  ): Promise<ListUserDto>;
  findAll(page?: number, limit?: number): Promise<ListUserDto[]>;
  findById(id: string): Promise<ListUserDto | null>;
  findByEmail(email: string): Promise<ListUserDto | null>;
  update(id: string, user: UpdateUserDto): Promise<ListUserDto>;
  updateCompanyAccess(
    user: User,
    companyId: string,
    role: Permission,
  ): Promise<ListUserDto>;
}
