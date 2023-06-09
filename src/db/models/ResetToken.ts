import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";

import { User } from "./User";

@Table({ tableName: "reset_tokens" })
export class ResetToken extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  public token!: string;

  @Unique
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public userId!: number;

  @BelongsTo(() => User)
  public user?: User;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isExpired!: boolean;

  declare readonly createdAt: Date;
}
