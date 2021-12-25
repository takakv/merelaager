require("dotenv").config();
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "registration",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      idCode: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      birthday: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      isOld: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      shiftNr: {
        type: DataTypes.INTEGER,
      },
      tsSize: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      addendum: {
        type: DataTypes.TEXT,
      },
      road: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      city: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      county: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      country: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "Eesti",
      },
      billNr: {
        type: DataTypes.INTEGER,
      },
      isRegistered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      contactName: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      contactNumber: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      contactEmail: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      backupTel: {
        type: DataTypes.TEXT,
      },
      pricePaid: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      priceToPay: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName:
        process.env.NODE_ENV === "prod"
          ? "registrations"
          : "test_registrations",
    }
  );
};
