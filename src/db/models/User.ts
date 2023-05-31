import { Optional } from "sequelize";
import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
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

import { ShiftInfo } from "./ShiftInfo";
import { ResetToken } from "./ResetToken";
import { Staff } from "./Staff";
import { Document } from "./Document";
import { UserRole } from "./UserRole";
import { Role } from "./Role";

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  currentShift: number;
  nickname: string;
  password: string;
  refreshToken: string;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "role" | "currentShift" | "nickname" | "refreshToken"
>;

@Table({ tableName: "users" })
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
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
  // Master users are bosses of at least one shift.
  // OP users are instructors.
  // Campers are campers.
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

  @HasOne(() => ShiftInfo)
  public shiftInfo?: ShiftInfo;

  @HasOne(() => ResetToken)
  public resetToken?: ResetToken;

  @HasMany(() => Staff)
  public shifts?: Staff[];

  @HasMany(() => Document, {
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  })
  public documents?: Document[];

  @BelongsToMany(() => Role, () => UserRole, "roleId")
  roles: UserRole[];
}
