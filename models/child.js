const { DataTypes } = require("sequelize");

// Table Name is used to create foreign key link in newShift.
module.exports = (sequelize) =>
  sequelize.define(
    "child",
    {
      id: {
        type: DataTypes.STRING,
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
      // This field must be cleared after every summer
      // for data privacy reasons.
      parentNotes: {
        type: DataTypes.TEXT,
      },
    },
    { tableName: "childlist" }
  );
