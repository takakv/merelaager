const { DataTypes } = require("sequelize");

const roles = {
  boss: "boss",
  full: "full",
  part: "part",
};

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
        defaultValue: new Date().getUTCFullYear(),
      },
      name: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.ENUM(roles.boss, roles.full, roles.part),
        allowNull: false,
      },
    },
    { tableName: "staff" }
  );
