import { DataTypes } from "sequelize";

module.exports = (sequelize) =>
  sequelize.define(
    "tent",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      shift: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      childId: {
        type: DataTypes.INTEGER,
      },
      gender: {
        type: DataTypes.ENUM("F", "M"),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "tents" }
  );
