import { sequelize } from "./db/sequelize";
import { runApp } from "./app";
import Initialiser from "./utilities/Initialiser";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful");
    await sequelize.sync({ alter: true });
    console.log("Models synchronised");
  } catch (e) {
    console.error(e);
    return;
  }

  await Initialiser.initAll();
  runApp();
})();
