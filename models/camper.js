const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "camper",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      nimi: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isikukood: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      sugu: {
        type: DataTypes.ENUM("Tüdruk", "Poiss"),
        allowNull: false,
      },
      synnipaev: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      vana_olija: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      kontakt_nimi: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      kontakt_number: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      kontakt_email: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      varu_tel: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
    },
    {
      tableName: "Laagrilapsed",
    }
  );
};
