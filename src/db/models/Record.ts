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

interface RecordAttributes {
  id: number;
  childId: number;
  shiftNr: number;
  year: number;
}

interface RecordCreationAttributes extends Optional<RecordAttributes, "id"> {}

@Table({ tableName: "records" })
export class Record
  extends Model<RecordAttributes, RecordCreationAttributes>
  implements RecordAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @ForeignKey(() => Child)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public childId!: number;

  @BelongsTo(() => Child)
  public child?: Child;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public shiftNr!: number;

  @AllowNull(false)
  @Default(new Date().getFullYear())
  @Column(DataType.INTEGER.UNSIGNED)
  public year!: number;
}
