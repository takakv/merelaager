import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import Child from "./child";
import Registration from "./registration";
import Record from "./record";
import User from "./user";
import Staff from "./staff";
import ResetToken from "./resetToken";
import ShiftData from "./shiftData";
import ShiftInfo from "./shiftInfo";

dotenv.config();

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PWD;
const dbname = process.env.MYSQL_DB;

const sequelize = new Sequelize(
  `mysql://${user}:${pass}@${host}:3306/${dbname}`,
  { logging: false }
);

Child.hasMany(Registration);
Registration.belongsTo(Child);

Child.hasMany(Record);
Record.belongsTo(Child);

User.hasMany(Staff);
Staff.belongsTo(User);

User.hasOne(ResetToken);
ResetToken.belongsTo(User);

ShiftInfo.hasMany(ShiftData);
ShiftData.belongsTo(ShiftInfo);

export { Sequelize, sequelize };
