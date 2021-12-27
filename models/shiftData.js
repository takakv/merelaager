const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "shift_data",
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
      tentNr: {
        type: DataTypes.INTEGER,
      },
      parentNotes: {
        type: DataTypes.TEXT,
      },
      isPresent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { tableName: "shift_data" }
  );
