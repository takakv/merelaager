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
      regOrder: {
        type: DataTypes.INTEGER,
      },
      isRegistered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      shiftNr: {
        type: DataTypes.INTEGER,
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
    { tableName: "registrations" }
  );
};