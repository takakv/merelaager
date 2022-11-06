import { Optional } from "sequelize";
import { Table, Column, Model, BelongsToMany } from "sequelize-typescript";
import { ACGroup } from "./ACGroup";
import { GroupPermission } from "./GroupPermission";

interface PermissionAttributes {
  id: number;
  name: string;
}

type PermissionCreationAttributes = Optional<PermissionAttributes, "id">;

@Table
export class Permission extends Model<
  PermissionAttributes,
  PermissionCreationAttributes
> {
  @Column
  name: string;

  @BelongsToMany(() => ACGroup, () => GroupPermission)
  groups: Array<ACGroup & { GroupPermission: GroupPermission }>;
}
