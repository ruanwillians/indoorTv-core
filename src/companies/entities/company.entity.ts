import { BadRequestException } from '@nestjs/common';
import { Address } from './address.entity';

export class Company {
  private _id: string;
  private _name: string;
  private _document: string;
  private _ownerId: string;
  private _address: Address;

  constructor(
    id: string,
    name: string,
    document: string,
    ownerId: string,
    address: Address = null,
  ) {
    this._id = id;
    this._name = name;
    this._document = document;
    this._ownerId = ownerId;
    this._address = address;

    this.validate();
  }

  validate() {
    if (!this._name) {
      throw new BadRequestException('Nome é um campo obrigatório');
    }

    if (!this._document) {
      throw new BadRequestException('Documento é um campo obrigatório');
    }

    if (this._document.length !== 11) {
      throw new BadRequestException('Document must be 11 characters long');
    }
  }

  changeName(name: string) {
    this._name = name;
    this.validate();
  }

  changeDocument(document: string) {
    this._document = document;
    this.validate();
  }

  addAddress(address: Address) {
    this._address = address;
  }

  removeAddress(addressId: string) {
    this._address = null;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get document(): string {
    return this._document;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get addresses(): Address {
    return this._address;
  }
}
