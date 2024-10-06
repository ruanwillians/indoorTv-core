import { Company } from '@prisma/client';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  document: string;
  companies?: Company[];
}
