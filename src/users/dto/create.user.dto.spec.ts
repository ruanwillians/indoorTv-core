import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  let dto: CreateUserDto;

  beforeEach(() => {
    dto = new CreateUserDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = 'secret123';
    dto.document = '12345678901';
    dto.isActive = false;
  });

  it('should validate a valid DTO', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when the name is too short', async () => {
    dto.name = 'Jo';
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isLength');
    expect(errors[0].constraints.isLength).toEqual(
      'O nome deve ter entre 3 e 50 caracteres.',
    );
  });

  it('should fail when the email is invalid', async () => {
    dto.email = 'invalid-email';
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isEmail');
    expect(errors[0].constraints.isEmail).toEqual('O email deve ser válido.');
  });

  it('should fail when the password is too short', async () => {
    dto.password = '123';
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isLength');
    expect(errors[0].constraints.isLength).toEqual(
      'A senha deve ter entre 6 e 20 caracteres.',
    );
  });

  it('should fail when the document is not 11 characters long', async () => {
    dto.document = '123456';
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isLength');
    expect(errors[0].constraints.isLength).toEqual(
      'O documento deve ter 11 caracteres.',
    );
  });

  it('should fail when isActive is not a boolean', async () => {
    dto.isActive = 'true' as any;
    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('isBoolean');
    expect(errors[0].constraints.isBoolean).toEqual(
      'O campo isActive deve ser um valor booleano.',
    );
  });
});
