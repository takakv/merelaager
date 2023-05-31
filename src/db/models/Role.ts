import {
  Table,
  Column,
  Model,
  BelongsToMany,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from "sequelize-typescript";

import { Permission } from "./Permission";
import { RolePermission } from "./RolePermission";
import { User } from "./User";
import { UserRole } from "./UserRole";

@Table({ tableName: "roles" })
export class Role extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id!: number;

  @Column
  roleName: string;

  @BelongsToMany(() => Permission, () => RolePermission, "permissionId")
  permissions: Permission[];

  @BelongsToMany(() => User, () => UserRole, "userId")
  users: User[];
}
