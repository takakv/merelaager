const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PWD;
const dbname = process.env.MYSQL_DB;

// const dbCon = mysql.createConnection({
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PWD,
//     database: process.env.MYSQL_DB,
// });
//
// dbCon.connect((err) => {
//     if (err) throw err;
//     console.log("Connected");
// });

const sequelize = new Sequelize(
  `mysql://${user}:${pass}@${host}:3306/${dbname}`
);

sequelize
  .authenticate()
  .then(() => console.log("Database connection successful."))
  .catch((err) => console.error("Database connection failed:", err));

const Camper = sequelize.define("Camper", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nimi: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isikukood: {
        type: DataTypes.STRING,
    },
    sugu: {
        type: DataTypes.ENUM("T", "P"),
        allowNull: false
    },
    synnipaev: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    vana_olija: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    tableName: "Laagrilapsed"
});

sequelize.sync();

module.exports = sequelize;
