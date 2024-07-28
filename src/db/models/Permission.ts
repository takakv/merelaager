import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
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

  @BelongsToMany(() => Role, () => RolePermission)
  roles: Role[];
}
