import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Registration } from "./Registration";

@Table({ tableName: "bills" })
export class Bill extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id!: number;

  @AllowNull(false)
  @Column
  contactName: string;

  @AllowNull(false)
  @Column
  billTotal: number;

  @AllowNull(false)
  @Default(false)
  @Column
  isPaid: boolean;

  @HasMany(() => Registration)
  registration?: Registration[];
}
