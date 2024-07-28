import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";

import { Shift } from "./Shift";
import { ResetToken } from "./ResetToken";
import { ShiftStaff } from "./ShiftStaff";
import { Document } from "./Document";
import { UserShiftRole } from "./UserShiftRole";

@Table({ tableName: "users" })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @Unique({ name: "username", msg: "username_should_be_unique" })
  @AllowNull(false)
  @Column(DataType.STRING)
  public username!: string;

  @Unique({ name: "email", msg: "email_should_be_unique" })
  @Column(DataType.STRING)
  public email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public name!: string;

  @AllowNull(false)
  @Default("std")
  // Root users have all system permissions.
  // STD is a miscellaneous role.
  @Column(DataType.ENUM("root", "std", "master", "op", "camper"))
  public role!: string;

  @Column(DataType.INTEGER.UNSIGNED)
  public currentShift: number;

  @Column(DataType.STRING)
  public nickname: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public password!: string;

  @Column(DataType.STRING)
  public refreshToken: string;

  @HasOne(() => Shift)
  public shiftInfo?: Shift;

  @HasOne(() => ResetToken)
  public resetToken?: ResetToken;

  @HasMany(() => ShiftStaff)
  public shifts?: ShiftStaff[];

  @HasMany(() => Document, {
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  })
  public documents?: Document[];

  @HasMany(() => UserShiftRole)
  shiftRoles: UserShiftRole[];
}
