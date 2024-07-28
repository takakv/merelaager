import {
  AllowNull, AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

import { Role } from "./Role";
import { User } from "./User";

@Table({ tableName: "user_roles" })
export class UserShiftRole extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  shiftNr!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Role)
  @Column(DataType.INTEGER.UNSIGNED)
  roleId: number;

  @BelongsTo(() => Role)
  role: Role;
}
