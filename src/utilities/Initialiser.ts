import dotenv from "dotenv";

import { Registration } from "../db/models/Registration";
import GlobalStore from "./GlobalStore";
import MailService from "../controllers/MailService";
import { Bill } from "../db/models/Bill";

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
    let prevNr: number = await Bill.max("id");
    if (prevNr < 2025000) prevNr = new Date().getUTCFullYear() * 1000;
    GlobalStore.billNumber = prevNr + 1;
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
  };
}

export default Initialiser;
