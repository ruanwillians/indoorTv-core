import { emailRegex } from '../../@shared/utils/regex';
import { ValidationEntityError } from '../../@shared/errors/validationEntityErrors';
import { Company } from '../../companies/entities/company.entity';
import { BadRequestException } from '@nestjs/common';

export class User {
  private _id: string;
  private _name: string;
  private _email: string;
  private _password: string;
  private _isActive: boolean;
  private _document: string;
  private _companies: Company[] = [];

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    document: string,
    companies: Company[] = [],
    isActive: boolean = false,
  ) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._password = password;
    this._document = document;
    this.companies = companies;
    this._isActive = isActive;

    this.validate();
  }

  validate() {
    if (!this.name) {
      throw new ValidationEntityError('Nome é um campo obrigatório', 'name');
    }

    if (!this.document) {
      throw new ValidationEntityError(
        'Documento é um campo obrigatório',
        'document',
      );
    }

    if (this.document.length !== 11) {
      throw new ValidationEntityError(
        'Document must be 11 characters long',
        'document',
      );
    }

    if (!this.email) {
      throw new ValidationEntityError('Email é um campo obrigatório', 'email');
    }

    if (this.email) {
      if (!emailRegex.test(this.email)) {
        throw new ValidationEntityError('Email inválido', 'email');
      }
    }

    if (!this.password) {
      throw new ValidationEntityError(
        'Senha é um campo obrigatório',
        'password',
      );
    }
  }

  public toObject() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      isActive: this._isActive,
      document: this._document,
      companies: this._companies,
    };
  }

  changeName(name: string) {
    this._name = name;
    this.validate();
  }

  changeEmail(email: string) {
    this._email = email;
    this.validate();
  }

  changePassword(newPassword: string) {
    if (newPassword.length < 6 || newPassword.length > 20) {
      throw new BadRequestException(
        'Password must be between 6 and 20 characters long',
      );
    }
    this._password = newPassword;
  }

  defineAccessCompanies(company: Company) {
    this._companies.push(company);
  }

  activate() {
    this._isActive = true;
  }

  deactivate() {
    this._isActive = false;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get document(): string {
    return this._document;
  }

  set document(value: string) {
    this._document = value;
  }

  get companies(): Company[] {
    return this._companies || [];
  }

  set companies(value: Company[]) {
    this._companies = value;
  }
}
