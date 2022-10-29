import { Response } from "express";
import { registrationManager } from "../utilities/eventEmitter";

export const emitRegistration = (res: Response) => {
  registrationManager.on("create", () => {
    console.log("Registration created");
  });

  registrationManager.on("update", () => {
    console.log("Registration updated");
  });

  registrationManager.on("delete", () => {
    console.log("Registration deleted");
  });
};

emitRegistration(null);
