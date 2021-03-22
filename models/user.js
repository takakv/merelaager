require("dotenv").config();
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "user",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
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
      tableName: process.env.NODE_ENV === "prod" ? "Kasutajad" : "Testijad",
    }
  );
};
