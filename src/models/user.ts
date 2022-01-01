require("dotenv").config();
import { DataTypes } from "sequelize";

module.exports = (sequelize) => {
  return sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "username",
      },
      nickname: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.ENUM("root", "boss", "std", "master", "op", "camper"),
        defaultValue: "std",
      },
      shifts: {
        type: DataTypes.INTEGER,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.STRING,
      },
    },
    { tableName: "users" }
  );
};
