import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index";

interface TeamAttributes {
  id: number;
  shiftNr: number;
  name: string;
  year: number;
  place: number;
}

class Team extends Model<TeamAttributes> implements TeamAttributes {
  public id!: number;
  public shiftNr!: number;
  public name!: string;
  public year!: number;
  public place: number;
}

Team.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shiftNr: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    place: {
      type: DataTypes.INTEGER,
    },
  },
  { tableName: "teams", sequelize }
);

export default Team;
