import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

import { Child } from "./models/Child";
import { Record } from "./models/Record";
import { Registration } from "./models/Registration";
import { ResetToken } from "./models/ResetToken";
import { ShiftData } from "./models/ShiftData";
import { Shift } from "./models/Shift";
import { SignUpToken } from "./models/SignUpToken";
import { ShiftStaff } from "./models/ShiftStaff";
import { Team } from "./models/Team";
import { User } from "./models/User";
import { EventInfo } from "./models/EventInfo";
import { Document } from "./models/Document";
import { Permission } from "./models/Permission";
import { Role } from "./models/Role";
import { RolePermission } from "./models/RolePermission";
import { UserShiftRole } from "./models/UserShiftRole";
import { TentScores } from "./models/TentScores";
import { Bill } from "./models/Bill";

dotenv.config();

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PWD;
const dbname = process.env.MYSQL_DB;

export const sequelize = new Sequelize(dbname, user, pass, {
  dialect: "mariadb",
  host: host,
  port: 3306,
  models: [
    Registration,
    Team,
    Child,
    Record,
    ResetToken,
    ShiftData,
    Shift,
    SignUpToken,
    ShiftStaff,
    User,
    EventInfo,
    Document,
    Permission,
    Role,
    RolePermission,
    UserShiftRole,
    TentScores,
    Bill,
  ],
  logging: false,
  // models: [__dirname + "/models"],
});
