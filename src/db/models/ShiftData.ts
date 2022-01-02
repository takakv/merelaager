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
import { Child } from "./Child";
import { Team } from "./Team";

interface ShiftDataAttributes {
  id: number;
  childId: number;
  shiftNr: number;
  tentNr: number;
  teamId: number;
  parentNotes: string;
  isPresent: boolean;
}

interface ShiftDataCreationAttributes
  extends Optional<
    ShiftDataAttributes,
    "id" | "tentNr" | "teamId" | "parentNotes" | "isPresent"
  > {}

@Table({ tableName: "shift_data" })
export class ShiftData
  extends Model<ShiftDataAttributes, ShiftDataCreationAttributes>
  implements ShiftDataAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @ForeignKey(() => Child)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public childId!: number;

  @BelongsTo(() => Child)
  public child?: Child;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public shiftNr!: number;

  @Column(DataType.INTEGER.UNSIGNED)
  public tentNr: number;

  @ForeignKey(() => Team)
  @Column(DataType.INTEGER.UNSIGNED)
  public teamId: number;

  @BelongsTo(() => Team)
  public team?: Team;

  @Column(DataType.TEXT)
  public parentNotes: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public isPresent!: boolean;
}