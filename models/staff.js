const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "staff",
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
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { tableName: "staff" }
  );
