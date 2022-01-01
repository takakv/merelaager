import {Sequelize} from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PWD;
const dbname = process.env.MYSQL_DB;

const sequelize = new Sequelize(
  `mysql://${user}:${pass}@${host}:3306/${dbname}`,
  { logging: false }
);

sequelize
  .authenticate()
  .then(() => console.log("Database connection successful."))
  .catch((err) => console.error("Database connection failed:", err));

const db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  registrations: require("./registration")(sequelize),
  users: require("./user")(sequelize),
  shiftData: require("./shiftData")(sequelize),
  child: require("./child")(sequelize),
  team: require("./team")(sequelize),
  suToken: require("./suToken")(sequelize),
  staff: require("./staff")(sequelize),
  shiftInfo: require("./shiftInfo")(sequelize),
  records: require("./record")(sequelize),
  resetToken: require("./resetToken")(sequelize),
};

db.child.hasMany(db.shiftData);
db.shiftData.belongsTo(db.child);

db.users.hasOne(db.resetToken);
db.resetToken.belongsTo(db.users);

db.team.hasMany(db.shiftData);
db.shiftData.belongsTo(db.team);

db.users.hasMany(db.staff);
db.staff.belongsTo(db.users);

db.child.hasMany(db.registrations);
db.registrations.belongsTo(db.child);

db.shiftInfo.hasMany(db.registrations, {
  foreignKey: "shiftNr",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
db.registrations.belongsTo(db.shiftInfo, {
  foreignKey: "shiftNr",
});

db.users.hasMany(db.shiftInfo, {
  foreignKey: "bossId",
});
db.shiftInfo.belongsTo(db.users, {
  foreignKey: "bossId",
});

db.child.hasMany(db.records);
db.records.belongsTo(db.child);

export default db;
