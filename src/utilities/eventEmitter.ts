import EventEmitter from "events";
import { Registration } from "../db/models/Registration";
import { RegistrationEntry } from "../routes/Support Files/registrations";

class RegistrationManager extends EventEmitter {
  register(registrations: Registration[]) {
    const entries: RegistrationEntry[] = [];

    registrations.forEach(async (registration: Registration) => {
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
        // UA 2022
        addendum: registration.addendum,
      };
      entries.push(entry);
      console.log(entry);
    });
    this.emit("create");
  }
}

export const registrationManager = new RegistrationManager();
