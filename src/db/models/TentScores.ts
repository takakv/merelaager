import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

@Table({ tableName: "tent_scores" })
export class TentScores extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public shiftNr!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  public tentNr!: number;

  @AllowNull(false)
  @Column(DataType.TINYINT.UNSIGNED)
  public score!: number;
}
