const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "child",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM("F", "M"),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "childlist" }
  );
