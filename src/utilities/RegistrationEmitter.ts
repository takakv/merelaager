import EventEmitter from "events";
import { Registration } from "../db/models/Registration";
import { RegistrationEntry } from "../routes/Support Files/registrations";

class RegistrationEmitter extends EventEmitter {
  async register(registrations: Registration[]) {
    const entries: RegistrationEntry[] = [];

    for (const registration of registrations) {
      const child = await registration.$get("child", {
        attributes: ["name", "gender"],
      });

      const entry: RegistrationEntry = {
        id: registration.id,
        name: child.name,
        gender: child.gender,
        dob: registration.birthday,
        old: registration.isOld,
        shiftNr: registration.shiftNr,
        shirtSize: registration.tsSize,
        order: registration.regOrder,
        registered: registration.isRegistered,
        addendum: registration.addendum,
        billNr: registration.billNr,
        contactName: registration.contactName,
        contactEmail: registration.contactEmail,
        contactPhone: registration.contactNumber,
        pricePaid: registration.pricePaid,
        priceToPay: registration.priceToPay,
        idCode: registration.idCode,
      };
      entries.push(entry);
    }

    this.emit("create", entries);
  }
}

export const registrationEmitter = new RegistrationEmitter();
