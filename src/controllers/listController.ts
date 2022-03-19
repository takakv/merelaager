import { Request } from "express";
import { Registration } from "../db/models/Registration";
import { Child } from "../db/models/Child";
import {
  PrintEntry,
  RegistrationEntry,
} from "../routes/Support Files/registrations";

require("dotenv").config();

const { generatePDF } = require("./listGenerator");
const {
  requireRoot,
  approveRole,
  approveShiftRole,
} = require("../routes/Support Files/shiftAuth");

import Entity = Express.Entity;

export const fetchRegistrations = async (req: Request) => {
  const camperRegistrations = await Registration.findAll({
    order: [["regOrder", "ASC"]],
    include: Child,
  });

  let registrations: RegistrationEntry[] = [];

  if (!camperRegistrations.length) return registrations;

  const { role } = req.user;
  const allowedRoles = ["op", "master", "boss", "root"];
  if (!allowedRoles.includes(role)) return registrations;

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

    if (role !== "op") {
      entry.billNr = registration.billNr;
      entry.contactName = registration.contactName;
      entry.contactEmail = registration.contactEmail;
      entry.contactPhone = registration.contactNumber;
      entry.pricePaid = registration.pricePaid;
      entry.priceToPay = registration.priceToPay;
    }

    if (role === "root") entry.idCode = registration.idCode;

    registrations.push(entry);
  });

  return registrations;
};

const verifyPrice = (price: string) => {
  const amount = parseInt(price, 10);
  return !isNaN(amount);
};

export const patchRegistration = async (req: Request, regId: number) => {
  if (isNaN(regId)) return 400;

  // Fetch first to check for permissions.
  const registration = await Registration.findByPk(regId);
  if (!registration) return 404;

  if (!(await approveShiftRole(req.user, "boss", registration.shiftNr)))
    return 403;

  const keys = Object.keys(req.body);

  let patchError = 0;

  keys.forEach((key) => {
    switch (key) {
      case "registered":
        registration.isRegistered = req.body.registered;
        break;
      case "old":
        registration.isOld = req.body.old;
        break;
      case "pricePaid":
        if (!requireRoot(req.user)) patchError = 403;
        if (!verifyPrice(req.body.pricePaid)) patchError = 400;
        registration.pricePaid = req.body.pricePaid;
        break;
      case "priceToPay":
        if (!requireRoot(req.user)) patchError = 403;
        if (!verifyPrice(req.body.priceToPay)) patchError = 400;
        registration.priceToPay = req.body.priceToPay;
        break;
      default:
        patchError = 422;
    }
  });

  if (patchError !== 0) return patchError;

  try {
    await registration.save();
  } catch (e) {
    console.error(e);
    return 500;
  }
  return 204;
};

export const deleteRegistration = async (user: Entity, regId: number) => {
  if (isNaN(regId)) return 400;

  // Fetch first to check for permissions.
  const registration = await Registration.findByPk(regId);
  if (!registration) return 404;

  if (!(await approveShiftRole(user, "boss", registration.shiftNr))) return 403;

  try {
    await registration.destroy();
  } catch (e) {
    console.error(e);
    return 500;
  }
  return 204;
};

export const print = async (user: Entity, shiftNr: number) => {
  if (!(await approveRole(user, "master"))) return null;

  const registrations = await Registration.findAll({
    where: { shiftNr, isRegistered: true },
    include: { model: Child, order: [["name", "ASC"]] },
  });

  if (!registrations.length) return null;

  const entries: PrintEntry[] = [];

  registrations.forEach((registration) => {
    entries.push({
      name: registration.child.name,
      gender: registration.child.gender,
      dob: registration.birthday,
      old: registration.isOld,
      shirtSize: registration.tsSize,
      contactName: registration.contactName.trim(),
      contactEmail: registration.contactEmail.trim(),
      contactNumber: registration.contactNumber.trim(),
    });
  });

  return generatePDF(shiftNr, entries);
};
