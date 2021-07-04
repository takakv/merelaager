require("dotenv").config();
const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "signup_token",
    {
      token: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      usedDate: {
        type: DataTypes.DATE
      },
    },
    {
      tableName: "signup_tokens",
    }
  );
};
