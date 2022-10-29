import { response, Response } from "express";
import { RegistrationEntry } from "../routes/Support Files/registrations";
import { registrationEmitter } from "../utilities/RegistrationEmitter";

export const emitRegistration = (res: Response, role: string) => {
  registrationEmitter.on("create", (entries: RegistrationEntry[]) => {
    console.log("Registration created");

    if (role === "op")
      entries.forEach((entry: RegistrationEntry) => {
        delete entry.billNr;
        delete entry.contactName;
        delete entry.contactEmail;
        delete entry.contactPhone;
        delete entry.pricePaid;
        delete entry.priceToPay;
        delete entry.idCode;
      });
    else if (role !== "root")
      entries.forEach((entry: RegistrationEntry) => {
        delete entry.idCode;
      });

    console.log(entries);
    entries.forEach((entry) => {
      response.write(`data: ${JSON.stringify(entry)}`);
    });
    response.write("\n\n");
    console.log("Wrote some response");
  });

  registrationEmitter.on("update", () => {
    console.log("Registration updated");
  });

  registrationEmitter.on("delete", () => {
    console.log("Registration deleted");
  });
};
