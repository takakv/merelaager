import { DataTypes } from "sequelize";

// Table Name is used to create foreign key link in newShift.
module.exports = (sequelize) =>
  sequelize.define(
    "shiftInfo",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      bossName: {
        type: DataTypes.STRING,
      },
      bossEmail: {
        type: DataTypes.STRING,
      },
      bossNum: {
        type: DataTypes.STRING,
      },
      startDate: {
        type: DataTypes.DATEONLY,
      },
      length: {
        type: DataTypes.INTEGER,
      },
    },
    { tableName: "shiftInfo" }
  );
