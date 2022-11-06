import { Optional } from "sequelize";
import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { User } from "./User";
import { ACGroup } from "./ACGroup";

export const roles = {
  boss: "boss",
  full: "full",
  part: "part",
  guest: "guest",
};

interface StaffAttributes {
  id: number;
  shiftNr: number;
  year: number;
  name: string;
  role: string;
  userId: number;
}

type StaffCreationAttributes = Optional<
  StaffAttributes,
  "id" | "year" | "userId"
>;

@Table({ tableName: "staff" })
export class Staff
  extends Model<StaffAttributes, StaffCreationAttributes>
  implements StaffAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public shiftNr!: number;

  @AllowNull(false)
  @Default(new Date().getFullYear())
  @Column(DataType.INTEGER.UNSIGNED)
  public year!: number;

  @Column(DataType.STRING)
  public name: string;

  @AllowNull(false)
  @Default(roles.part)
  @Column(DataType.ENUM(roles.boss, roles.full, roles.part, roles.guest))
  public role!: string;

  @ForeignKey(() => User)
  public userId: number;

  @BelongsTo(() => User)
  public user?: User;

  @ForeignKey(() => ACGroup)
  acGroupId: number;

  @BelongsTo(() => ACGroup)
  acGroup: ACGroup;
}
