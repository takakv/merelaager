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
import { User } from "./User";

interface DocumentAttributes {
  id: number;
  filename: string;
  accessLevel: string;
  name: string;
  ownerId: number;
}

interface DocumentCreationAttributes
  extends Optional<DocumentAttributes, "id"> {}

@Table({ tableName: "documents" })
export class Document
  extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @Column(DataType.STRING)
  public filename: string;

  @Column(DataType.TEXT)
  public accessLevel: string;

  @Column(DataType.TEXT)
  public name: string;

  /*
  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  public ownerId: number;

  @BelongsTo(() => User)
  public owner: User;
  */
}
