import {
  IsEmail,
  IsString,
  IsBoolean,
  Length,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @Length(3, 50, { message: 'O nome deve ter entre 3 e 50 caracteres.' })
  name: string;

  @IsEmail({}, { message: 'O email deve ser válido.' })
  email: string;

  @IsString()
  @Length(6, 20, { message: 'A senha deve ter entre 6 e 20 caracteres.' })
  password: string;

  @Length(11, 11, { message: 'O documento deve ter 11 caracteres.' })
  document: string;

  @IsBoolean({ message: 'O campo isActive deve ser um valor booleano.' })
  isActive: boolean = false;
}
