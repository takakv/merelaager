import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import User from "./User";

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
  userId: number;
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
  public userId: number;
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
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
  },
  { tableName: "staff", sequelize }
);

export default Staff;

User.hasMany(Staff, { foreignKey: "userId" });
Staff.belongsTo(User, { foreignKey: "userId" });
