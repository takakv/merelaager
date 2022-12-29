import { Optional } from "sequelize";
import {
  Table,
  Column,
  Model,
  BelongsToMany,
  DataType,
  AllowNull,
} from "sequelize-typescript";
import { ACGroup } from "./ACGroup";
import { GroupPermission } from "./GroupPermission";

interface PermissionAttributes {
  id: number;
  name: string;
  extent: string;
}

type PermissionCreationAttributes = Optional<PermissionAttributes, "id">;

@Table({ tableName: "permissions" })
export class Permission extends Model<
  PermissionAttributes,
  PermissionCreationAttributes
> {
  @Column
  name: string;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  extent: number;

  @BelongsToMany(() => ACGroup, () => GroupPermission)
  groups: Array<ACGroup & { GroupPermission: GroupPermission }>;
}
