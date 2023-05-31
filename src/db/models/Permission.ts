import {
  Table,
  Column,
  Model,
  BelongsToMany,
  PrimaryKey,
  AutoIncrement, DataType,
} from "sequelize-typescript";

import { Role } from "./Role";
import { RolePermission } from "./RolePermission";

@Table({ tableName: "permissions" })
export class Permission extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  id!: number;

  @Column
  permissionName!: string;

  @BelongsToMany(() => Role, () => RolePermission, "roleId")
  roles: Role[];
}
