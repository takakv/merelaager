require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./data/campData.sqlite",
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

const slots = sequelize.define("slot", {
  shift: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  boySlots: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 18,
  },
  girlSlots: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 18,
  },
});

const setUp = async () => {
  await bills.sync({ alter: true });
  await slots.sync({ alter: true });
  await bills.findOrCreate({ where: { billNr: 21000 } });
  for (let i = 0; i < 4; ++i) {
    await slots.findOrCreate({
      where: {
        shift: i + 1,
      },
    });
  }
};

setUp();

exports.bills = bills;
exports.slots = slots;
