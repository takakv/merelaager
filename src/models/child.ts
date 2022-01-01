import { DataTypes } from "sequelize";

module.exports = (sequelize) =>
  sequelize.define(
    "child",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM("M", "F"),
        allowNull: false,
      },
      yearsAtCamp: {
        type: DataTypes.INTEGER,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "children" }
  );
