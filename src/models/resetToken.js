require("dotenv").config();
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "resetToken",
    {
      token: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      isExpired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    { tableName: "reset_tokens" }
  );
};
