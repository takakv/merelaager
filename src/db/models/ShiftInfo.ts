import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { User } from "./User";
import { Registration } from "./Registration";

interface ShiftInfoAttributes {
  id: number;
  bossId: number;
  bossName: string;
  bossEmail: string;
  bossPhone: string;
  startDate: Date;
  length: number;
}

@Table({ tableName: "shift_info" })
export class ShiftInfo
  extends Model<ShiftInfoAttributes>
  implements ShiftInfoAttributes
{
  @PrimaryKey
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  public bossId: number;

  @BelongsTo(() => User)
  public user?: User;

  @Column(DataType.STRING)
  public bossName: string;

  @Column(DataType.STRING)
  public bossEmail: string;

  @Column(DataType.STRING)
  public bossPhone: string;

  @Column(DataType.DATEONLY)
  public startDate: Date;

  @Column(DataType.INTEGER.UNSIGNED)
  public length: number;

  @HasMany(() => Registration)
  public registrations?: Registration[];
}