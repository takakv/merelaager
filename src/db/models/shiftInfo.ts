import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index";

interface ShiftInfoAttributes {
  id: number;
  bossName: string;
  bossEmail: string;
  bossPhone: string;
  startDate: string;
  length: number;
}

class ShiftInfo
  extends Model<ShiftInfoAttributes>
  implements ShiftInfoAttributes
{
  public id!: number;
  bossName: string;
  bossEmail: string;
  bossPhone: string;
  startDate: string;
  length: number;
}

ShiftInfo.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    bossName: {
      type: DataTypes.STRING,
    },
    bossEmail: {
      type: DataTypes.STRING,
    },
    bossPhone: {
      type: DataTypes.STRING,
    },
    startDate: {
      type: DataTypes.DATEONLY,
    },
    length: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
  },
  { tableName: "shiftInfo", sequelize }
);

export default ShiftInfo;
