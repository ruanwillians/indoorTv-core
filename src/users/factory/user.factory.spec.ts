import { CreateUserDto } from '../dto/createUser.dto';
import { User } from '../entities/user.entity';
import { randomUUID } from 'crypto';
import UserFactory from './user.factory';
import { Company } from '../../companies/entities/company.entity';

describe('UserFactory', () => {
  const mockCompany = new Company(
    randomUUID(),
    'Test Company',
    '12345678901',
    randomUUID(),
  );

  it('should create a user with valid data', () => {
    const userDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      document: '42356886598',
    };

    const user = UserFactory.create(userDto);

    expect(user).toBeDefined();
    expect(user.name).toBe(userDto.name);
    expect(user.email).toBe(userDto.email);
    expect(user.password).toBe(userDto.password);
    expect(user.document).toBe(userDto.document);
  });

  it('should create a user and associate a company', () => {
    const userDto: CreateUserDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password456',
      document: '42356886599',
    };

    const user = UserFactory.createWithCompany(userDto, mockCompany);

    expect(user).toBeDefined();
    expect(user.companies).toHaveLength(1);
    expect(user.companies[0]).toEqual(mockCompany);
  });
});
