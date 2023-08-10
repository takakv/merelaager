import dotenv from "dotenv";

import { Registration } from "../db/models/Registration";
import GlobalStore from "./GlobalStore";
import MailService from "../controllers/MailService";
import { Bill } from "../db/models/Bill";
import { col, fn } from "sequelize";

dotenv.config();

class Initialiser {
  public static initRegistrationOrder = async () => {
    const previousRegistration = await Registration.findOne({
      order: [["regOrder", "DESC"]],
      attributes: ["regOrder"],
    });
    if (previousRegistration)
      GlobalStore.registrationOrder = previousRegistration.regOrder + 1;
  };

  public static initBillNumber = async () => {
    const prevNr: number = await Bill.max("id");
    //const prevNr = previousBill.billNr ?? new Date().getUTCFullYear() * 1000;
    GlobalStore.billNumber = prevNr + 1;
  };

  public static setUnlocked = () => {
    if (process.env.NODE_ENV === "dev" || process.env.UNLOCK) {
      GlobalStore.registrationUnlocked = true;
      return;
    }

    const now = Date.now();
    const unlockTime = GlobalStore.registrationUnlockTime.getTime();

    if (now > unlockTime) {
      GlobalStore.registrationUnlocked = true;
      return;
    }

    const eta = GlobalStore.registrationUnlockTime.getTime() - now;
    setTimeout(() => {
      GlobalStore.registrationUnlocked = true;
    }, eta);
  };

  public static initMailService = () => {
    GlobalStore.mailService = new MailService();
  };

  public static initAll = async () => {
    await this.initRegistrationOrder();
    console.log(`Reg order: ${GlobalStore.registrationOrder}`);

    await this.initBillNumber();
    console.log(`Bill number: ${GlobalStore.billNumber}`);

    this.initMailService();

    this.setUnlocked();
    console.log(
      `Registration is unlocked? ${GlobalStore.registrationUnlocked}`
    );
    console.log(
      `Unlocks at: ${GlobalStore.registrationUnlockTime.toLocaleString(
        "en-GB",
        {
          timeZone: "Europe/Tallinn",
        }
      )} (Estonian time)`
    );
  };
}

export default Initialiser;
