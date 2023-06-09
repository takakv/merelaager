import { Optional } from "sequelize";
import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Child } from "./Child";
import { Shift } from "./Shift";

interface RegistrationAttributes {
  id: number;
  childId: number;
  idCode: string;
  shiftNr: number;
  isRegistered: boolean;
  regOrder: number;
  isOld: boolean;
  birthday: Date;
  tsSize: string;
  addendum: string;
  road: string;
  city: string;
  county: string;
  country: string;
  billNr: number;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  backupTel: string;
  pricePaid: number;
  priceToPay: number;
  notifSent: boolean;
}

type RegistrationCreationAttributes = Optional<
  RegistrationAttributes,
  "id" | "pricePaid"
>;

@Table({ tableName: "registrations" })
export class Registration
  extends Model<RegistrationAttributes, RegistrationCreationAttributes>
  implements RegistrationAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @ForeignKey(() => Child)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public childId!: number;

  @BelongsTo(() => Child, "childId")
  public child?: Child;

  @Column(DataType.STRING)
  public idCode: string;

  @ForeignKey(() => Shift)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public shiftNr!: number;

  @BelongsTo(() => Shift)
  public shift?: Shift;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isRegistered!: boolean;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public regOrder!: number;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  public isOld!: boolean;

  @Column(DataType.DATEONLY)
  public birthday: Date;

  @Column(DataType.STRING)
  public tsSize: string;

  @Column(DataType.TEXT)
  public addendum: string;

  @Column(DataType.STRING)
  public road: string;

  @Column(DataType.STRING)
  public city: string;

  @Column(DataType.STRING)
  public county: string;

  @Default("Eesti")
  @Column(DataType.STRING)
  public country: string;

  @Default(null)
  @Column(DataType.INTEGER.UNSIGNED)
  public billNr: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  public contactName!: string;

  @Column(DataType.STRING)
  public contactNumber: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public contactEmail!: string;

  @Column(DataType.STRING)
  public backupTel: string;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER.UNSIGNED)
  public pricePaid!: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER.UNSIGNED)
  public priceToPay: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  public notifSent: boolean;
}
