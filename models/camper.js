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
      },
      sugu: {
        type: DataTypes.ENUM("T", "P"),
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
    },
    {
      tableName: "Laagrilapsed",
    }
  );
};
