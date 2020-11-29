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
        defaultValue: true,
      },
      vahetus: {
        type: DataTypes.ENUM("1v", "2v", "3v", "4v"),
        allowNull: false,
      },
      ts_suurus: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tanav: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      linn: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      indeks: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      maakond: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      riik: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "Eesti",
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
