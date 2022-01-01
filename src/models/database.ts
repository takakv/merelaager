import { Sequelize } from "sequelize";

const sequelize = "";

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
