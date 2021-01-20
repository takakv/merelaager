require("dotenv").config();
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "camper",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      shift: {
        type: DataTypes.ENUM("1v", "2v", "3v", "4v"),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
      },
      tent: {
        type: DataTypes.INTEGER,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: process.env.NODE_ENV === "prod" ? "V_lapsed" : "T_V_lapsed",
    }
  );
};
