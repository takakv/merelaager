import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

const roles = {
  boss: "boss",
  full: "full",
  part: "part",
  guest: "guest",
};

interface StaffAttributes {
  id: number;
  shiftNr: number;
  year: number;
  name: string;
  role: string;
}

interface StaffCreationAttributes extends Optional<StaffAttributes, "id"> {}

class Staff
  extends Model<StaffAttributes, StaffCreationAttributes>
  implements StaffAttributes
{
  public id!: number;
  public shiftNr!: number;
  public year!: number;
  public name: string;
  public role!: string;
}

Staff.init(
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
    year: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: new Date().getUTCFullYear(),
    },
    name: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM(roles.boss, roles.full, roles.part, roles.guest),
      allowNull: false,
      defaultValue: roles.full,
    },
  },
  { tableName: "staff", sequelize }
);

export default Staff;
