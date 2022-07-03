import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Team } from "./Team";
import { EventInfo } from "./EventInfo";

interface TeamEventAttributes {
  place: number;
}

@Table({ tableName: "team_event" })
export class TeamEvent
  extends Model<TeamEventAttributes>
  implements TeamEventAttributes
{
  @ForeignKey(() => Team)
  @Column(DataType.INTEGER.UNSIGNED)
  public teamId!: number;

  @ForeignKey(() => EventInfo)
  @Column(DataType.INTEGER.UNSIGNED)
  public eventId!: number;

  @AllowNull(true)
  @Column(DataType.INTEGER.UNSIGNED)
  public place: number;
}
