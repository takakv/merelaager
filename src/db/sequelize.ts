import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config();

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PWD;
const dbname = process.env.MYSQL_DB;

export const sequelize = new Sequelize(dbname, user, pass, {
  dialect: "mariadb",
  host: host,
  port: 3306,
  models: [__dirname + "/models"],
});
