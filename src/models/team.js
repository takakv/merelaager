const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "team",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      shiftNr: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      place: {
        type: DataTypes.INTEGER,
      },
    },
    { tableName: "teams" }
  );
