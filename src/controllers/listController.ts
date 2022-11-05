import {Request} from "express";
import {Registration} from "../db/models/Registration";
import {Child} from "../db/models/Child";
import {PrintEntry, RegistrationEntry,} from "../routes/Support Files/registrations";
import {ShiftData} from "../db/models/ShiftData";
import {StatusCodes} from "http-status-codes";

require("dotenv").config();

const {generatePDF} = require("./listGenerator");
const {
  userIsRoot,
  approveRole,
} = require("../routes/Support Files/shiftAuth");

import Entity = Express.Entity;

type registrationResponse = {
  ok: boolean,
  code: number,
  message: string,
  payload?: RegistrationEntry
}

const prepareRegistrationEntry = (data: Registration, role: string) => {
  const entry: RegistrationEntry = {
    id: data.id,
    name: data.child.name,
    gender: data.child.gender,
    dob: data.birthday,
    old: data.isOld,
    shiftNr: data.shiftNr,
    shirtSize: data.tsSize,
    order: data.regOrder,
    registered: data.isRegistered,
  }

  if (role !== "op") {
    entry.billNr = data.billNr;
    entry.contactName = data.contactName;
    entry.contactEmail = data.contactEmail;
    entry.contactPhone = data.contactNumber;
    entry.pricePaid = data.pricePaid;
    entry.priceToPay = data.priceToPay;
  }

  if (role === "root") entry.idCode = data.idCode;
  return entry;
}

export const fetchRegistration = async (req: Request, regId: number) => {
  const response: registrationResponse = {
    ok: true,
    code: StatusCodes.OK,
    message: "",
  };

  if (isNaN(regId)) {
    response.ok = false;
    response.code = StatusCodes.BAD_REQUEST;
    response.message = "Registration identifier malformed or missing";
    return response;
  }

  const registration = await Registration.findByPk(regId, {
    include: Child
  });
  if (!registration) {
    response.ok = false;
    response.code = StatusCodes.NOT_FOUND;
    response.message = "Unknown registration identifier";
    return response;
  }

  const {role} = req.user;
  const allowedRoles = ["op", "master", "boss", "root"];
  if (!allowedRoles.includes(role)) {
    response.ok = false;
    response.code = StatusCodes.FORBIDDEN;
    response.message = "Insufficient rights to access content"
    return response;
  }

  response.payload = prepareRegistrationEntry(registration, role);
  return response;
}


export const fetchRegistrations = async (req: Request) => {
  const camperRegistrations = await Registration.findAll({
    order: [["regOrder", "ASC"]],
    include: Child,
  });

  const registrations: RegistrationEntry[] = [];

  if (!camperRegistrations.length) return registrations;

  const {role} = req.user;
  const allowedRoles = ["op", "master", "boss", "root"];
  if (!allowedRoles.includes(role)) return registrations;

  camperRegistrations.forEach((registration) => {
    const entry = prepareRegistrationEntry(registration, role);
    registrations.push(entry);
  });

  return registrations;
};

const verifyPrice = (price: string) => {
  const amount = parseInt(price, 10);
  return !isNaN(amount);
};

const updateData = async (registration: Registration) => {
  const {shiftNr} = registration;

  const child = await Child.findOne({
    where: {id: registration.childId},
  });

  const [entry, created] = await ShiftData.findOrCreate({
    where: {childId: child.id, shiftNr},
    defaults: {
      childId: child.id,
      shiftNr,
      parentNotes: registration.addendum,
      isActive: registration.isRegistered,
    },
  });

  if (!created) {
    entry.isActive = registration.isRegistered;
    await entry.save();
  }
};

export const patchRegistration = async (req: Request, regId: number) => {
  const response = {
    ok: true,
    code: StatusCodes.OK,
    message: "",
  };

  if (isNaN(regId)) {
    response.ok = false;
    response.code = StatusCodes.BAD_REQUEST;
    response.message = "Registration identifier malformed or missing";
    return response;
  }

  // Fetch first to check for permissions.
  const registration = await Registration.findByPk(regId);
  if (!registration) {
    response.ok = false;
    response.code = StatusCodes.NOT_FOUND;
    response.message = "Unknown registration identifier";
    return response;
  }

  if (!(await approveShiftRole(req.user, "boss", registration.shiftNr))) {
    response.ok = false;
    response.code = StatusCodes.FORBIDDEN;
    response.message = "Insufficient rights to access content"
    return response;
  }

  const keys = Object.keys(req.body);
  logObj.setAndCommit({ registrationId: regId, field: keys[0] });

  let patchError = 0;

  keys.forEach((key) => {
    switch (key) {
      case "registered":
        registration.isRegistered = req.body.registered;
        updateData(registration);
        break;
      case "old":
        registration.isOld = req.body.old;
        break;
      case "pricePaid":
        if (!userIsRoot(req.user)) patchError = 403;
        if (!verifyPrice(req.body.pricePaid)) patchError = 400;
        registration.pricePaid = req.body.pricePaid;
        break;
      case "priceToPay":
        if (!userIsRoot(req.user)) patchError = 403;
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
    logObj.log();
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

  const logObj = new UserLogEntry(
    user.id,
    loggingModules.registrations,
    loggingActions.delete
  );

  if (!(await approveShiftRole(user, "boss", registration.shiftNr, logObj)))
    return 403;

  logObj.setAndCommit({ registrationId: regId });

  try {
    await registration.destroy();
    logObj.log();
  } catch (e) {
    console.error(e);
    return 500;
  }
  return 204;
};

export const print = async (user: Entity, shiftNr: number) => {
  if (!(await approveRole(user, "master"))) return null;

  const registrations = await Registration.findAll({
    where: {shiftNr, isRegistered: true},
    include: {model: Child, order: [["name", "ASC"]]},
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
