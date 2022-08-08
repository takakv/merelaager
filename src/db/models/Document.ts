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

export const roles = {
  boss: "boss",
  full: "full",
  part: "part",
  guest: "guest",
};

interface DocumentAttributes {
  id: number;
  shiftNr: number;
  year: number;
  name: string;
  role: string;
}

interface DocumentCreationAttributes
  extends Optional<DocumentAttributes, "id" | "year"> {}

@Table({ tableName: "documents" })
export class Document
  extends Model<DocumentAttributes, DocumentCreationAttributes>
  implements DocumentAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public shiftNr!: number;

  @AllowNull(false)
  @Default(new Date().getFullYear())
  @Column(DataType.INTEGER.UNSIGNED)
  public year!: number;

  @Column(DataType.STRING)
  public name: string;

  @AllowNull(false)
  @Default(roles.part)
  @Column(DataType.ENUM(roles.boss, roles.full, roles.part, roles.guest))
  public role!: string;
}
