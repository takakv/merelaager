import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

interface TeamAttributes {
  id: number;
  shiftNr: number;
  name: string;
  year: number;
  place: number;
}

interface TeamCreationAttributes
  extends Optional<TeamAttributes, "id" | "year" | "place"> {}

class Team
  extends Model<TeamAttributes, TeamCreationAttributes>
  implements TeamAttributes
{
  public id!: number;
  public shiftNr!: number;
  public name!: string;
  public year!: number;
  public place: number;
}

Team.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: new Date().getFullYear(),
    },
    place: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
  },
  { tableName: "teams", sequelize }
);

export default Team;
