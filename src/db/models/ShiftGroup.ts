import { Optional } from "sequelize";
import {
  Table,
  Column,
  Model,
  ForeignKey,
  AllowNull,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
} from "sequelize-typescript";
import { ACGroup } from "./ACGroup";
import { User } from "./User";

interface ShiftGroupAttributes {
  id: number;
  shiftNr: number;
  userId: number;
  groupId: number;
}

type ShiftGroupCreationAttributes = Optional<ShiftGroupAttributes, "id">;

@Table({ tableName: "shift_groups" })
export class ShiftGroup extends Model<
  ShiftGroupAttributes,
  ShiftGroupCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  shiftNr: number;

  @ForeignKey(() => ACGroup)
  @Column
  groupId: number;

  @BelongsTo(() => ACGroup)
  acGroup: ACGroup;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
