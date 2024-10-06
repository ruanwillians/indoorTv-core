import { BadRequestException } from '@nestjs/common';
import { Company } from './company.entity';
import { randomUUID } from 'crypto';
import { Address } from './address.entity';

class MockAddress extends Address {
  constructor(id: string) {
    super(id);
  }
}

describe('Company Entity Tests', () => {
  it('should create a company from valid data', () => {
    const company = new Company(
      randomUUID(),
      'Company Name',
      '12345678901',
      randomUUID(),
    );

    expect(company).toBeDefined();
    expect(company.name).toBe('Company Name');
    expect(company.document).toBe('12345678901');
  });

  it('should throw an error when creating a company with an invalid name', () => {
    expect(() => {
      new Company(randomUUID(), '', '12345678901', randomUUID());
    }).toThrow(BadRequestException);
    expect(() => {
      new Company(randomUUID(), '', '12345678901', randomUUID());
    }).toThrow('Nome é um campo obrigatório');
  });

  it('should throw an error when creating a company with an invalid document', () => {
    expect(() => {
      new Company(randomUUID(), 'Valid Name', '', randomUUID());
    }).toThrow(BadRequestException);
    expect(() => {
      new Company(randomUUID(), 'Valid Name', '123', randomUUID());
    }).toThrow(BadRequestException);
  });

  it('should change the company name', () => {
    const company = new Company(
      randomUUID(),
      'Old Name',
      '12345678901',
      randomUUID(),
    );
    company.changeName('New Name');
    expect(company.name).toBe('New Name');
  });

  it('should throw an error when changing to an invalid name', () => {
    const company = new Company(
      randomUUID(),
      'Old Name',
      '12345678901',
      randomUUID(),
    );
    expect(() => company.changeName('')).toThrow(BadRequestException);
  });

  it('should change the company document', () => {
    const company = new Company(
      randomUUID(),
      'Company Name',
      '12345678901',
      randomUUID(),
    );
    company.changeDocument('10987654321');
    expect(company.document).toBe('10987654321');
  });

  it('should throw an error when changing to an invalid document', () => {
    const company = new Company(
      randomUUID(),
      'Company Name',
      '12345678901',
      randomUUID(),
    );
    expect(() => company.changeDocument('')).toThrow(BadRequestException);
    expect(() => company.changeDocument('123')).toThrow(BadRequestException);
  });

  it('should add an address to the company', () => {
    const company = new Company(
      randomUUID(),
      'Company Name',
      '12345678901',
      randomUUID(),
    );
    const address = new MockAddress(randomUUID());
    company.addAddress(address);
    expect(company.addresses).toEqual(address);
  });

  it('should remove the address from the company', () => {
    const company = new Company(
      randomUUID(),
      'Company Name',
      '12345678901',
      randomUUID(),
    );
    const address = new MockAddress(randomUUID());
    company.addAddress(address);
    company.removeAddress(address.id);
    expect(company.addresses).toBeNull();
  });
});
