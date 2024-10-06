export class Address {
  private _id: string;

  constructor(id: string) {
    this._id = id;
  }

  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }
}
