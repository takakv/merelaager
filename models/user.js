require("dotenv").config();
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        type: DataTypes.ENUM("boss", "master", "op", "camper"),
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
    {
      tableName: "users",
    }
  );
};
