import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

import { User } from "./User";

@Table({ tableName: "documents" })
export class Document extends Model {
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

  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  public ownerId: number;

  @BelongsTo(() => User)
  public owner: User;
}
