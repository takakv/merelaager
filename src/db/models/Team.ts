import { Optional } from "sequelize";
import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { ShiftData } from "./ShiftData";
import { Child } from "./Child";

interface TeamAttributes {
  id: number;
  shiftNr: number;
  name: string;
  year: number;
  place: number;
  captainId: number;
}

interface TeamCreationAttributes
  extends Optional<TeamAttributes, "id" | "year" | "place" | "captainId"> {}

@Table({ tableName: "teams" })
export class Team
  extends Model<TeamAttributes, TeamCreationAttributes>
  implements TeamAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public shiftNr!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  public name!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public year!: number;

  @Column(DataType.INTEGER.UNSIGNED)
  public place: number;

  @HasMany(() => ShiftData)
  public members?: ShiftData[];

  @ForeignKey(() => Child)
  @Column(DataType.INTEGER.UNSIGNED)
  public captainId: number;

  @BelongsTo(() => Child, {
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  })
  public captain: Child;
}
