import { sequelize } from "./db/sequelize";
import { runApp } from "./app";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful");
    await sequelize.sync();
    console.log("Models synchronised");
  } catch (e) {
    console.error(e);
    return;
  }

  console.log("Starting app...");

  runApp();
})();
