import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index";
import User from "./User";

interface ShiftInfoAttributes {
  id: number;
  bossId: number;
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
  bossId: number;
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
    bossId: {
      type: DataTypes.INTEGER.UNSIGNED,
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
  { tableName: "shift_info", sequelize }
);

export default ShiftInfo;

User.hasMany(ShiftInfo, { foreignKey: "bossId" });
ShiftInfo.belongsTo(User, { foreignKey: "bossId" });
