import { Optional } from "sequelize";
import { Table, Column, Model, ForeignKey } from "sequelize-typescript";
import { ACGroup } from "./ACGroup";
import { Permission } from "./Permission";

interface GroupPermissionAttributes {
  id: number;
  groupId: number;
  permissionId: number;
}

type GroupPermissionCreationAttributes = Optional<
  GroupPermissionAttributes,
  "id"
>;

@Table({ tableName: "group_permissions" })
export class GroupPermission extends Model<
  GroupPermissionAttributes,
  GroupPermissionCreationAttributes
> {
  @ForeignKey(() => ACGroup)
  @Column
  groupId: number;

  @ForeignKey(() => Permission)
  @Column
  permissionId: number;
}
