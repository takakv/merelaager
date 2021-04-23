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
      childId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "childlist",
          key: "id",
        },
      },
      tentNr: {
        type: DataTypes.INTEGER,
      },
    },
    { tableName: "shift_data" }
  );
