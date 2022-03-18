import { Request, Response } from "express";

require("dotenv").config();

const { generatePDF } = require("./listGenerator");
const {
  approveShift,
  approveShiftAndGetRole,
} = require("../routes/Support Files/shiftAuth");

import { Registration } from "../db/models/Registration";
import { Child } from "../db/models/Child";
import Entity = Express.Entity;
import { RegistrationEntry } from "../routes/Support Files/registrations";

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

export const patchRegistration = async (req: Request, regId: number) => {
  if (isNaN(regId)) return 400;

  const registration = await Registration.findByPk(regId);
  if (!registration) return 404;

  const userRole = await approveShiftAndGetRole(req.user, registration.shiftNr);
  if (!userRole || (userRole !== "boss" && userRole !== "root")) return 403;

  const keys = Object.keys(req.body);

  let patchError = false;

  keys.forEach((key) => {
    switch (key) {
      case "registered":
        registration.isRegistered = req.body.registered;
        break;
      case "old":
        registration.isOld = req.body.old;
        break;
      case "pricePaid":
        if (userRole !== "root") return;
        registration.pricePaid = req.body.pricePaid;
        break;
      case "priceToPay":
        if (userRole !== "root") return;
        registration.priceToPay = req.body.priceToPay;
        break;
      default:
        patchError = true;
    }
  });

  if (patchError) return 422;

  await registration.save();
  return 204;
};

export const update = async (req: Request, res: Response) => {
  // Entry ID and field to update.
  if (!req.params.userId || !req.params.field)
    return res.sendStatus(400) && null;

  const id: number = parseInt(req.params.userId);
  const action = req.params.field;

  // Entry value, if needed.
  if ((action === "total-paid" || action === "total-due") && !req.params.value)
    return res.sendStatus(400) && null;

  const camper = await getCamper(id, req.user);
  if (!camper.ok) return res.sendStatus(camper.code) && null;

  switch (action) {
    // Toggle the camper registration status.
    case "registration":
      await Registration.update(
        { isRegistered: !camper.data.isRegistered },
        { where: { id } }
      );
      return true;
    // Toggle whether the camper has been to the camp before.
    case "regular":
      await Registration.update(
        { isOld: !camper.data.isOld },
        { where: { id } }
      );
      return true;
  }

  if (req.user.role !== "root") {
    console.log("User not authorised for price manipulation.");
    return res.sendStatus(404) && null;
  }

  const value = parseInt(req.params.value);
  if (isNaN(value)) {
    res.sendStatus(400);
    return null;
  }

  switch (action) {
    // Update the amount that has been paid for the camper.
    case "total-paid":
      await Registration.update({ pricePaid: value }, { where: { id } });
      break;
    // Update the total amount due fo the camper.
    case "total-due":
      await Registration.update({ priceToPay: value }, { where: { id } });
      break;
    default:
      res.sendStatus(400);
      return null;
  }
  return true;
};

const getCamper = async (id: number, queryUser: Entity) => {
  const camper = await Registration.findByPk(id);
  if (!camper)
    return {
      code: 404,
      message: "Camper not found",
      ok: false,
    };

  // Evaluate access rights.
  const shift = camper.shiftNr;
  if (!(await approveShift(queryUser, shift))) {
    const message = "User not authorised for the shift";
    console.log(message);
    return {
      code: 403,
      message,
      ok: false,
    };
  }

  return {
    code: 200,
    message: "",
    ok: true,
    data: camper,
  };
};

exports.remove = async (req: Request, res: Response) => {
  // Entry ID check.
  if (!req.params.userId) return res.sendStatus(400) && null;

  const id = parseInt(req.params.userId);
  const camper = await getCamper(id, req.user);
  if (!camper.ok) return res.sendStatus(camper.code) && null;

  await Registration.destroy({ where: { id } });
  return true;
};

exports.print = async (shiftNr: number) => {
  const children = await Registration.findAll({
    where: { shiftNr, isRegistered: true },
    include: {
      model: Child,
      order: [["name", "ASC"]],
    },
  });

  if (!children.length) return null;

  let childrenInfo = [];

  children.forEach((child) => {
    childrenInfo.push({
      name: child.child.name,
      gender: child.child.gender,
      birthday: child.birthday,
      isOld: child.isOld,
      tsSize: child.tsSize,
      contactName: child.contactName.trim(),
      contactEmail: child.contactEmail.trim(),
      contactNr: child.contactNumber.trim(),
    });
  });

  return generatePDF(shiftNr, childrenInfo);
};
