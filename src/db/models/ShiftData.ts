import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index";
import Child from "./Child";
import Team from "./Team";

interface ShiftDataAttributes {
  id: number;
  childId: number;
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
  public childId!: number;
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
    childId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
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

Child.hasMany(ShiftData, { foreignKey: "childId" });
ShiftData.belongsTo(Child, { foreignKey: "childId" });

Team.hasMany(ShiftData);
ShiftData.belongsTo(Team);
