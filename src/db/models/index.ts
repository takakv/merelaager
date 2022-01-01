import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import Child from "./child";
import Registration from "./registration";
import Record from "./record";
import User from "./user";
import Staff from "./staff";

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

// Child.hasMany(Record);
Record.belongsTo(Child);

// User.hasMany(Staff);
Staff.belongsTo(User);
