require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./data/bills.sqlite",
});

sequelize
  .authenticate()
  .then(() => console.log("Database connection successful."))
  .catch((err) => console.error("Database connection failed:", err));

const bills = sequelize.define(
  "bill",
  {
    billNr: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
  },
  { tableName: "bills" }
);

const setUp = async () => {
  await bills.sync({ alter: true });
  await bills.findOrCreate({ where: { billNr: 21000 } });
};

setUp();

module.exports = bills;
