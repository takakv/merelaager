import dotenv from "dotenv";

import { Registration } from "../db/models/Registration";
import Counters from "./Counters";
import MailService from "../controllers/MailService";

dotenv.config();

class Initialiser {
  public static initRegistrationOrder = async () => {
    const previousRegistration = await Registration.findOne({
      order: [["regOrder", "DESC"]],
      attributes: ["regOrder"],
    });
    if (previousRegistration)
      Counters.registrationOrder = previousRegistration.regOrder + 1;
  };

  public static initBillNumber = async () => {
    const previousBill = await Registration.findOne({
      order: [["billNr", "DESC"]],
      attributes: ["billNr"],
    });
    const prevNr = previousBill.billNr ?? new Date().getUTCFullYear() * 1000;
    Counters.billNumber = prevNr + 1;
  };

  public static setUnlocked = () => {
    if (process.env.NODE_ENV === "dev" || process.env.UNLOCK) {
      Counters.registrationUnlocked = true;
      return;
    }

    const now = Date.now();
    const unlockTime = Counters.registrationUnlockTime.getTime();

    if (now > unlockTime) {
      Counters.registrationUnlocked = true;
      return;
    }

    const eta = Counters.registrationUnlockTime.getTime() - now;
    setTimeout(() => {
      Counters.registrationUnlocked = true;
    }, eta);
  };

  public static initMailService = () => {
    Counters.mailService = new MailService();
  };

  public static initAll = async () => {
    await this.initRegistrationOrder();
    console.log(`Reg order: ${Counters.registrationOrder}`);

    await this.initBillNumber();
    console.log(`Bill number: ${Counters.billNumber}`);

    this.initMailService();

    this.setUnlocked();
    console.log(`Registration is unlocked? ${Counters.registrationUnlocked}`);
    console.log(
      `Unlocks at: ${Counters.registrationUnlockTime.toLocaleString("en-GB", {
        timeZone: "Europe/Tallinn",
      })} (Estonian time)`
    );
  };
}

export default Initialiser;
