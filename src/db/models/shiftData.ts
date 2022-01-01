import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index";

interface ShiftDataAttributes {
  id: number;
  shiftNr: number;
  tentNr: number;
  parentNotes: string;
  isPresent: boolean;
}

class ShiftData
  extends Model<ShiftDataAttributes>
  implements ShiftDataAttributes
{
  public id!: number;
  public shiftNr!: number;
  public tentNr: number;
  public parentNotes: string;
  public isPresent: boolean;
}

ShiftData.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    shiftNr: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    tentNr: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    parentNotes: {
      type: DataTypes.TEXT,
    },
    isPresent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName: "shift_data", sequelize }
);

export default ShiftData;
