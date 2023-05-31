import {
  Table,
  Column,
  Model,
  ForeignKey,
  AllowNull,
  DataType,
} from "sequelize-typescript";

import { Role } from "./Role";
import { User } from "./User";

@Table({ tableName: "user_roles" })
export class UserRole extends Model {
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  shiftNr: number;

  @ForeignKey(() => Role)
  @Column
  roleId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;
}
