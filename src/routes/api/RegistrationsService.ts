import { Registration } from "./db/models/Registration";
import { Child } from "./db/models/Child";
import { RegistrationEntry } from "./routes/Support Files/registrations";

export class RegistrationsService {
  public async getAll(): Promise<RegistrationEntry[]> {
    const camperRegistrations = await Registration.findAll({
      order: [["regOrder", "ASC"]],
      include: Child,
    });

    let registrations: RegistrationEntry[] = [];

    if (!camperRegistrations.length) return registrations;

    camperRegistrations.forEach((registration) => {
      const entry: RegistrationEntry = {
        id: registration.id,
        name: registration.child.name,
        gender: registration.child.gender,
        dob: registration.birthday,
        old: registration.isOld,
        shiftNr: registration.shiftNr,
        shirtSize: registration.tsSize,
        order: registration.regOrder,
        registered: registration.isRegistered,
      };
      registrations.push(entry);
    });
    return registrations;
  }
}
