import { randomUUID } from 'crypto';
import { User } from './user.entity';
import { ValidationEntityError } from '../../@shared/errors/validationEntityErrors';

describe('User entity Test', () => {
  it('should create a user from valid data', async () => {
    const user = new User(
      randomUUID(),
      'John Doe',
      'john@example.com',
      'password123',
      '42356886598',
    );

    expect(user).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(user.password).toBe('password123');
    expect(user.document).toBe('42356886598');
    expect(user.isActive).toBeFalsy();
  });

  it('should throw an error when creating a user with an invalid name', async () => {
    expect(() => {
      new User(
        randomUUID(),
        '',
        'john@example.com',
        'password123',
        '42356886598',
      );
    }).toThrow('Nome é um campo obrigatório');
  });

  it('should throw an error when creating a user with an invalid document (must be 11)', async () => {
    expect(() => {
      new User(randomUUID(), 'Teste', 'john@example.com', 'password123', '123');
    }).toThrow('Document must be 11 characters long');
  });

  it('should throw an error when creating a user with an invalid document', async () => {
    expect(() => {
      new User(randomUUID(), 'Teste', 'john@example.com', 'password123', '');
    }).toThrow('Documento é um campo obrigatório');
  });

  it('should throw an error when creating a user with an invalid name', async () => {
    expect(() => {
      new User(
        randomUUID(),
        '',
        'john@example.com',
        'password123',
        '42356886598',
      );
    }).toThrow(ValidationEntityError);
    try {
      new User(
        randomUUID(),
        '',
        'john@example.com',
        'password123',
        '42356886598',
      );
    } catch (e) {
      expect(e.message).toBe('Nome é um campo obrigatório');
      expect(e.field).toBe('name');
    }
  });

  it('should return the correct object representation', () => {
    const user = new User(
      randomUUID(),
      'John Doe',
      'john@example.com',
      'password123',
      '42356886598',
    ).toObject();

    expect(user).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      document: user.document,
      companies: user.companies,
    });
  });

  it("should change the user's password", async () => {
    const user = new User(
      randomUUID(),
      'John Doe',
      'john@example.com',
      'password123',
      '42356886598',
    );

    user.changePassword('newpassword123');
    expect(user.password).toBe('newpassword123');
  });

  it('should throw an error when changing to a short password', async () => {
    const user = new User(
      randomUUID(),
      'John Doe',
      'john@example.com',
      'password123',
      '42356886598',
    );

    expect(() => user.changePassword('short')).toThrow(
      'Password must be between 6 and 20 characters long',
    );
  });

  it('should activate the user', async () => {
    const user = new User(
      randomUUID(),
      'John Doe',
      'john@example.com',
      'password123',
      '42356886598',
    );

    user.activate();
    expect(user.isActive).toBe(true);
  });

  it('should deactivate the user', async () => {
    const user = new User(
      randomUUID(),
      'John Doe',
      'john@example.com',
      'password123',
      '42356886598',
    );

    user.deactivate();
    expect(user.isActive).toBe(false);
  });
});
