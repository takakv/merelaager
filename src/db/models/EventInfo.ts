import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { TeamEvent } from "./TeamEvent";
import { Team } from "./Team";

interface EventInfoAttributes {
  id: number;
  name: string;
  shiftNr: number;
  year: number;
}

@Table({ tableName: "event_info" })
export class EventInfo
  extends Model<EventInfoAttributes>
  implements EventInfoAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  public name!: string;

  @AllowNull(false)
  @Default(new Date().getFullYear())
  @Column(DataType.INTEGER.UNSIGNED)
  public year!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public shiftNr!: number;

  // @BelongsToMany(() => Team, () => TeamEvent, "eventId")
  // public teams?: Array<Team & { TeamEvent: TeamEvent }>;
}
