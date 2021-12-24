const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "record",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      shiftNr: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: new Date().getFullYear(),
      },
    },
    { tableName: "records" }
  );
};
