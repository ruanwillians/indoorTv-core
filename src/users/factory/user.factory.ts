import { randomUUID } from 'crypto';
import { CreateUserDto } from '../dto/createUser.dto';
import { User } from '../entities/user.entity';
import { v4 as uuid } from 'uuid';
import { Company } from '../..//companies/entities/company.entity';

export default class UserFactory {
  public static create({
    name,
    email,
    password,
    document,
  }: CreateUserDto): User {
    return new User(uuid(), name, email, password, document);
  }

  public static createWithCompany(user: CreateUserDto, company: Company): User {
    const createdUser = new User(
      uuid(),
      user.name,
      user.email,
      user.password,
      user.document,
    );
    createdUser.defineAccessCompanies(company);
    return createdUser;
  }
}
