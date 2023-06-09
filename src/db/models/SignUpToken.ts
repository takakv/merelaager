import { Optional } from "sequelize";
import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { roles } from "./ShiftStaff";

interface SignUpTokenAttributes {
  token: string;
  isExpired: boolean;
  email: string;
  shiftNr: number;
  role: string;
  usedDate: Date;
}

interface SignUpTokenCreationAttributes
  extends Optional<SignUpTokenAttributes, "isExpired" | "role" | "usedDate"> {}

@Table({ tableName: "signup_tokens" })
export class SignUpToken
  extends Model<SignUpTokenAttributes, SignUpTokenCreationAttributes>
  implements SignUpTokenAttributes
{
  @PrimaryKey
  @Column(DataType.UUID)
  public token!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public email!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isExpired!: boolean;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public shiftNr!: number;

  @AllowNull(false)
  @Default(roles.part)
  @Column(DataType.ENUM(roles.boss, roles.full, roles.part, roles.guest))
  public role!: string;

  @Column(DataType.DATE)
  public usedDate: Date;
}
