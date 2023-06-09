import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";

import { Role } from "./Role";
import { Permission } from "./Permission";

@Table({ tableName: "role_permissions" })
export class RolePermission extends Model {
  @ForeignKey(() => Role)
  @Column(DataType.INTEGER.UNSIGNED)
  roleId: number;

  @ForeignKey(() => Permission)
  @Column(DataType.INTEGER.UNSIGNED)
  permissionId: number;
}
