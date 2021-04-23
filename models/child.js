const { DataTypes } = require("sequelize");

// Table Name is used to create foreign key link in newShift
module.exports = (sequelize) =>
  sequelize.define(
    "child",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM("F", "M"),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "childlist" }
  );
