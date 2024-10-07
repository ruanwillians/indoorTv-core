import { CreateUserDto } from '../dto/create-user.dto';
import { ListUserDto } from '../dto/list.user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface UserRepositoryInterface {
  create(user: CreateUserDto): Promise<ListUserDto>;
  findAll(page?: number, limit?: number): Promise<ListUserDto[]>;
  findById(id: string): Promise<ListUserDto | null>;
  findByEmail(email: string): Promise<ListUserDto | null>;
  update(id: string, user: UpdateUserDto): Promise<ListUserDto>;
  remove(id: string): Promise<void>;
}
