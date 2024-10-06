import { Company } from 'src/companies/entities/company.entity';

export class ListUserDto {
  id: string;
  name: string;
  email: string;
  document: string;
  companies?: Company[];
  isActive: boolean;

  constructor(
    id: string,
    name: string,
    email: string,
    document: string,
    companies?: Company[],
    isActive?: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.document = document;
    this.companies = companies;
    this.isActive = isActive;
  }
}
