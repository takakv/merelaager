import { Optional } from "sequelize";
import {
  Table,
  Column,
  Model,
  BelongsToMany,
  HasMany,
} from "sequelize-typescript";
import { Permission } from "./Permission";
import { GroupPermission } from "./GroupPermission";
import { ShiftGroup } from "./ShiftGroup";

interface ACGroupAttributes {
  id: number;
  name: string;
}

type ACGroupCreationAttributes = Optional<ACGroupAttributes, "id">;

@Table({ tableName: "ac_groups" })
export class ACGroup extends Model<
  ACGroupAttributes,
  ACGroupCreationAttributes
> {
  @Column
  name: string;

  @BelongsToMany(() => Permission, () => GroupPermission)
  permissions: Permission[];

  @HasMany(() => ShiftGroup)
  shiftGroups: ShiftGroup[];

  // @BelongsToMany(() => User, () => ShiftGroup)
  // users: Array<User & { ShiftPermission: ShiftGroup }>;
}
