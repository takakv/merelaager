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
db.campers = require("./camper")(sequelize);
db.users = require("./user")(sequelize);

module.exports = db;
