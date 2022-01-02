import { Optional } from "sequelize";
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
import { ShiftInfo } from "./ShiftInfo";
import { ResetToken } from "./ResetToken";
import { Staff } from "./Staff";

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

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "role" | "currentShift" | "nickname" | "refreshToken"
  > {}

@Table({ tableName: "users" })
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  public username!: string;

  @Unique
  @Column(DataType.STRING)
  public email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public name!: string;

  @AllowNull(false)
  @Default("std")
  @Column(DataType.ENUM("root", "boss", "std", "master", "op", "camper"))
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
}
