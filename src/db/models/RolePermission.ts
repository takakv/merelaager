import { Table, Column, Model, ForeignKey } from "sequelize-typescript";

import { Role } from "./Role";
import { Permission } from "./Permission";

@Table({ tableName: "role_permissions" })
export class RolePermission extends Model {
  @ForeignKey(() => Role)
  @Column
  roleId: number;

  @ForeignKey(() => Permission)
  @Column
  permissionId: number;
}
