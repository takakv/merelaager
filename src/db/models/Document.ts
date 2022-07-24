import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { ShiftInfo } from "./ShiftInfo";
import { User } from "./User";

interface DocumentAttributes {
  id: number;
  filename: string;
  location: string;
  owner?: User;
}

@Table({ tableName: "documents" })
export class Document
  extends Model<DocumentAttributes>
  implements DocumentAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  public filename!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public location!: string;

  @BelongsTo(() => User)
  public owner?: User;
}
