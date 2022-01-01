import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  shifts: number;
  nickname: string;
  password: string;
  refreshToken: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public email: string;
  public name!: string;
  public role!: string;
  public shifts: number;
  public nickname: string;
  public password!: string;
  public refreshToken: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("root", "boss", "std", "master", "op", "camper"),
      defaultValue: "std",
      allowNull: false,
    },
    shifts: {
      type: DataTypes.INTEGER,
    },
    nickname: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
  },
  { tableName: "users", sequelize }
);

export default User;
