import { Sequelize } from "sequelize-typescript";
import { Child } from "./models/Child";
import { Record } from "./models/Record";
import { Registration } from "./models/Registration";
import { ResetToken } from "./models/ResetToken";
import { ShiftData } from "./models/ShiftData";
import { ShiftInfo } from "./models/ShiftInfo";
import { SignUpToken } from "./models/SignUpToken";
import { Staff } from "./models/Staff";
import { Team } from "./models/Team";
import { User } from "./models/User";

require("dotenv").config();

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PWD;
const dbname = process.env.MYSQL_DB;

export const sequelize = new Sequelize(dbname, user, pass, {
  dialect: "mariadb",
  host: host,
  port: 3306,
  models: [
    Child,
    Record,
    Registration,
    ResetToken,
    ShiftData,
    ShiftInfo,
    SignUpToken,
    Staff,
    Team,
    User,
  ],
  logging: false,
  // models: [__dirname + "/models"],
});