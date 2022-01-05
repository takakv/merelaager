import { sequelize } from "./db/sequelize";
import { runApp } from "./app";
import { initialiseRegistration } from "./controllers/registration/registrationController";

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

  await initialiseRegistration();
  runApp();
})();
