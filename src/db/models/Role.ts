import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

import { Permission } from "./Permission";
import { RolePermission } from "./RolePermission";
import { User } from "./User";
import { UserShiftRole } from "./UserShiftRole";

@Table({ tableName: "roles" })
export class Role extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id!: number;

  @Column
  roleName: string;

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions: Permission[];

  @HasMany(() => UserShiftRole)
  shiftRoles: UserShiftRole[];
}
