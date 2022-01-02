import { Optional } from "sequelize";
import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Registration } from "./Registration";
import { Record } from "./Record";
import { ShiftData } from "./ShiftData";

interface ChildAttributes {
  id: number;
  name: string;
  gender: string;
  yearsAtCamp: number;
  notes: string;
}

interface ChildCreationAttributes
  extends Optional<ChildAttributes, "id" | "yearsAtCamp" | "notes"> {}

@Table({ tableName: "children" })
export class Child
  extends Model<ChildAttributes, ChildCreationAttributes>
  implements ChildAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  public name!: string;

  @AllowNull(false)
  @Column(DataType.ENUM("M", "F"))
  public gender!: string;

  @Column(DataType.INTEGER.UNSIGNED)
  public yearsAtCamp: number;

  @Column(DataType.TEXT)
  public notes: string;

  @HasMany(() => Registration)
  public registrations?: Registration[];

  @HasMany(() => Record)
  public records?: Record[];

  @HasMany(() => ShiftData)
  public shiftData?: ShiftData[];
}
