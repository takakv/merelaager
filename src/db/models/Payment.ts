import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

interface PaymentAttributes {
  id: number;
  title: string;
  description: string;
  price: number;
  official: boolean;
}

@Table({ tableName: "payments" })
export class Payment
  extends Model<PaymentAttributes>
  implements PaymentAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  public id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  public title!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  public description: string;

  @Column(DataType.INTEGER.UNSIGNED)
  public price!: number;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public official!: boolean;
}
