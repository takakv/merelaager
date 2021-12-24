const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const pass = process.env.MYSQL_PWD;
const dbname = process.env.MYSQL_DB;

const sequelize = new Sequelize(
  `mysql://${user}:${pass}@${host}:3306/${dbname}`
);

sequelize
  .authenticate()
  .then(() => console.log("Database connection successful."))
  .catch((err) => console.error("Database connection failed:", err));

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.registrations = require("./registration")(sequelize);
db.users = require("./user")(sequelize);
db.shiftCampers = require("./shift")(sequelize);
db.children = require("./child")(sequelize);
db.shiftData = require("./newShift")(sequelize);
db.newChildren = require("./newChild")(sequelize);
db.team = require("./team")(sequelize);
db.suToken = require("./suToken")(sequelize);
db.staff = require("./staff")(sequelize);
db.shiftInfo = require("./shiftInfo")(sequelize);
db.records = require("./record")(sequelize);

db.newChildren.hasMany(db.shiftData);
db.shiftData.belongsTo(db.newChildren);
db.team.hasMany(db.shiftData);
db.shiftData.belongsTo(db.team);

db.users.hasMany(db.staff);
db.staff.belongsTo(db.users);

db.newChildren.hasMany(db.registrations);
db.registrations.belongsTo(db.newChildren);

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

db.newChildren.hasMany(db.records);
db.records.belongsTo(db.newChildren);

module.exports = db;
