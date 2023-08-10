import {
  AutoIncrement,
  Column,
  DataType,
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

  @Column
  contactName: string;

  @Column
  billTotal: number;

  @Column
  isPaid: boolean;

  @HasOne(() => Registration)
  registration?: Registration;
}
