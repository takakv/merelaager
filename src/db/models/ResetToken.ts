import { Optional } from "sequelize";
import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { User } from "./User";

interface ResetTokenAttributes {
  token: string;
  userId: number;
  isExpired: boolean;
}

interface ResetTokenCreationAttributes
  extends Optional<ResetTokenAttributes, "isExpired"> {}

@Table({ tableName: "reset_tokens" })
export class ResetToken
  extends Model<ResetTokenAttributes, ResetTokenCreationAttributes>
  implements ResetTokenAttributes
{
  @PrimaryKey
  @Column(DataType.STRING)
  public token!: string;

  @Unique
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public userId!: number;

  @BelongsTo(() => User)
  public user?: User;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isExpired!: boolean;

  declare readonly createdAt: Date;
}
