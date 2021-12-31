const { DataTypes } = require("sequelize");

const roles = {
  boss: "boss",
  full: "full",
  part: "part",
  guest: "guest",
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
        type: DataTypes.ENUM(roles.boss, roles.full, roles.part, roles.guest),
        allowNull: false,
        defaultValue: roles.full,
      },
    },
    { tableName: "staff" }
  );
