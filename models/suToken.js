require("dotenv").config();
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "signup_token",
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
      shiftNr: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("boss", "master", "op", "camper"),
        allowNull: false,
        defaultValue: "op",
      },
      usedDate: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "signup_tokens",
    }
  );
};
