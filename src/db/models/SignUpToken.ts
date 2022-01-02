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

interface SignUpTokenAttributes {
  token: string;
  isExpired: boolean;
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
  @Column(DataType.STRING)
  public token!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isExpired!: boolean;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public shiftNr!: number;

  @AllowNull(false)
  @Default("std")
  @Column(DataType.ENUM("boss", "master", "op", "std", "camper"))
  public role!: string;

  @Column(DataType.DATE)
  public usedDate: Date;
}
