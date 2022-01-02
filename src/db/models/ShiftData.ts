import { Association, DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import Child from "./Child";
import Team from "./Team";

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

class ShiftData
  extends Model<ShiftDataAttributes, ShiftDataCreationAttributes>
  implements ShiftDataAttributes
{
  public id!: number;
  public childId!: number;
  public shiftNr!: number;
  public tentNr: number;
  public teamId: number;
  public parentNotes: string;
  public isPresent!: boolean;

  declare readonly child?: Child;

  declare static associations: {
    child: Association<ShiftData, Child>;
  };
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
    teamId: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    parentNotes: {
      type: DataTypes.TEXT,
    },
    isPresent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  { tableName: "shift_data", sequelize }
);

export default ShiftData;

Child.hasMany(ShiftData, { foreignKey: "childId" });
ShiftData.belongsTo(Child, { foreignKey: "childId" });

Team.hasMany(ShiftData, { foreignKey: "teamId" });
ShiftData.belongsTo(Team, { foreignKey: "teamId" });
