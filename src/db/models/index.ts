import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import Child from "./child";
import Registration from "./registration";

dotenv.config();

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PWD;
const dbname = process.env.MYSQL_DB;

const sequelize = new Sequelize(
  `mysql://${user}:${pass}@${host}:3306/${dbname}`,
  { logging: false }
);

export { Sequelize, sequelize };

// Child.hasMany(Registration);
Registration.belongsTo(Child);
