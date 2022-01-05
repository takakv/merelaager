import { sequelize } from "./db/sequelize";
import { runApp } from "./app";
import {
  availableSlots,
  initialiseRegistration,
} from "./controllers/registration/registrationController";
import axios from "axios";

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
  // await axios.post(process.env.URL, availableSlots).catch();
  runApp();
})();
