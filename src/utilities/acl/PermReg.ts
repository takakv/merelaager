export enum PermView {
  BASIC = 1,
  CONTACT = 2,
  FULL = 3,
}

export enum PermEdit {
  BASIC = 1,
  FULL = 3,
  DELETE = 5,
  PRICE = 7,
}

class PermReg {
  static readonly prefix = "reg";

  static readonly view: number[] = Object.values(PermView).filter(
    (x: number): x is number => typeof x === "number"
  );
  static readonly edit = Object.values(PermEdit).filter(
    (x: number): x is number => typeof x === "number"
  );

  static getView(): string {
    return `${this.prefix}:view`;
  }

  static getEdit(): string {
    return `${this.prefix}:edit`;
  }
}

export default PermReg;
