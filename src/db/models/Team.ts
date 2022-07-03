import { Optional } from "sequelize";
import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { ShiftData } from "./ShiftData";

interface TeamAttributes {
  id: number;
  shiftNr: number;
  name: string;
  year: number;
  place: number;
}

interface TeamCreationAttributes
  extends Optional<TeamAttributes, "id" | "year" | "place"> {}

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
  @Default(new Date().getFullYear())
  @Column(DataType.INTEGER.UNSIGNED)
  public year!: number;

  @Column(DataType.INTEGER.UNSIGNED)
  public place: number;

  @HasMany(() => ShiftData)
  public members?: ShiftData[];

  // @BelongsToMany(() => EventInfo, () => TeamEvent, "teamId")
  // public events?: Array<EventInfo & { TeamEvent: TeamEvent }>;
}
