import { Request, Response } from "express";
import sequelize from "sequelize";
import dotenv from "dotenv";

import { Registration } from "../../db/models/Registration";
import { Child } from "../../db/models/Child";
import { StatusCodes } from "http-status-codes";
import { registrationEmitter } from "../../utilities/RegistrationEmitter";
import { RegistrationEntry } from "../../routes/Support Files/registrations";
import { clients } from "../../routes/api/registrations";

dotenv.config();

const meta = require("./meta");

const maxBatchRegistrations = 4;

let unlocked: boolean = process.env.NODE_ENV === "dev";

if (process.env.UNLOCK === "true") {
  unlocked = true;
} else if (process.env.NODE_ENV === "prod") {
  setTimeout(() => {
    unlocked = true;
  }, meta.eta);
}

export const availableSlots = {
  1: { M: 0, F: 0 },
  2: { M: 0, F: 0 },
  3: { M: 0, F: 0 },
  4: { M: 0, F: 0 },
  5: { M: 0, F: 0 },
};

let registrationOrder = 1;

const fetchPromises = () => {
  const promises = [];

  for (let i = 1; i <= 5; ++i) {
    promises.push(
      Registration.count({
        where: { isRegistered: true, shiftNr: i },
        include: { model: Child, as: "child", where: { gender: "M" } },
      })
    );
    promises.push(
      Registration.count({
        where: { isRegistered: true, shiftNr: i },
        include: { model: Child, as: "child", where: { gender: "F" } },
      })
    );
  }

  return promises;
};

const initializeAvailableSlots = async () => {
  const regCounts = await Promise.all(fetchPromises());
  for (let i = 1, j = 0; i <= 5; ++i) {
    // @ts-ignore
    availableSlots[i].M = meta.openSlots[i].M - regCounts[j++];
    // @ts-ignore
    availableSlots[i].F = meta.openSlots[i].F - regCounts[j++];
  }
};

const initializeRegistrationOrder = async () => {
  const prevReg = await Registration.findOne({
    order: [["regOrder", "DESC"]],
    attributes: ["regOrder"],
  });
  if (prevReg) registrationOrder = prevReg.regOrder + 1;
};

export const initialiseRegistration = async () => {
  await initializeAvailableSlots();
  console.log("Available slots:");
  console.log(availableSlots);

  await initializeRegistrationOrder();
  console.log(`Reg order: ${registrationOrder}`);

  console.log(`Registration is unlocked? ${unlocked}`);
  console.log(
    `Unlock date: ${meta.unlockTime.toLocaleString("en-GB", {
      timeZone: "Europe/Tallinn",
    })} (Estonian time)`
  );
  console.log(`Unlock delta: ${meta.eta}`);
};

const parseIdCode = (code: string) => {
  if (code.length !== 11) return null;
  if (code[0] !== "5" && code[0] !== "6") return null;

  const gender = code[0] === "5" ? "M" : "F";

  const year = parseInt(`20${code[1]}${code[2]}`);
  const month = parseInt(`${code[3]}${code[4]}`);
  const day = parseInt(`${code[5]}${code[6]}`);

  if (year < 0) return null;
  const fullYear = parseInt(`20${code[1]}${code[2]}`);

  if (day < 1) return null;
  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      if (day > 31) return null;
      break;
    case 4:
    case 6:
    case 9:
    case 11:
      if (day > 30) return null;
      break;
    case 2:
      if (day > 28) return null;
      break;
    default:
      return null;
  }

  const birthday = new Date(Date.UTC(fullYear, month - 1, day));

  return { gender, birthday };
};

export const create = async (req: Request, res: Response) => {
  try {
    const response = await newRegister(req.body);
    if (response.ok) return res.redirect("../reserv/");
    return res.status(response.code).json(response);
  } catch (e) {
    console.error(e);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      ok: false,
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Unhandled server-side exception",
    });
  }
};

interface payload {
  name: string[];
  idCode?: string[];
  gender?: string[];
  bDay?: string[];
  useIdCode?: string[];
  shiftNr: string[];
  tsSize: string[];
  newcomer?: string[];
  road: string[];
  city: string[];
  county: string[];
  country: string[];
  addendum: string[];
  childCount: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  backupTel?: string;
}

interface regEntry {
  regOrder: number;
  childId: number;
  idCode: string;
  shiftNr: number;
  isOld: boolean;
  birthday: Date;
  tsSize: string;
  addendum: string;
  road: string;
  city: string;
  county: string;
  country: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  backupTel: string;
  priceToPay: number;
}

const newRegister = async (payload: payload) => {
  const currentOrder = registrationOrder;
  ++registrationOrder;

  const response = {
    ok: true,
    code: StatusCodes.CREATED,
    message: "",
  };

  if (!unlocked) {
    response.ok = false;
    response.code = StatusCodes.FORBIDDEN;
    response.message = "Registration not open";
    return response;
  }

  const childCount = parseInt(payload.childCount);
  if (isNaN(childCount)) {
    response.ok = false;
    response.code = StatusCodes.BAD_REQUEST;
    response.message = "Could not parse the number of children";
    return response;
  }
  if (childCount < 1 || childCount > maxBatchRegistrations) {
    response.ok = false;
    response.code = StatusCodes.BAD_REQUEST;
    response.message = "Illegal number of children";
    return response;
  }

  type ObjectKey = keyof typeof payload;

  const arrayKeys: ObjectKey[] = [
    "name",
    "shiftNr",
    "tsSize",
    "road",
    "city",
    "county",
    "country",
    "addendum",
  ];

  for (const key of arrayKeys) {
    if (
      !payload.hasOwnProperty(key) ||
      !Array.isArray(payload[key]) ||
      payload[key].length != maxBatchRegistrations
    ) {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = `Property '${key}' is malformed or missing`;
      return response;
    }
  }

  const stringKeys: ObjectKey[] = [
    "contactName",
    "contactNumber",
    "contactEmail",
  ];

  for (const key of stringKeys) {
    if (!payload.hasOwnProperty(key) || typeof payload[key] !== "string") {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = `Property '${key}' is malformed or missing`;
      return response;
    }
  }

  const registrationEntries: regEntry[] = [];

  for (let i = 0; i < childCount; ++i) {
    let childId: number;

    // TODO: implement registration without ID code
    const parsedId = parseIdCode(payload.idCode[i]);
    if (!parsedId) {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = "ID code not properly formatted";
      return response;
    }

    const childName = payload.name[i].trim();
    if (!childName) {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = "Child name is missing or empty";
      return response;
    }
    const childInstance = await Child.findOrCreate({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("name")),
        "LIKE",
        "%" + childName.toLowerCase() + "%"
      ),
      attributes: ["id"],
      defaults: {
        name: childName,
        gender: parsedId.gender,
      },
    });

    childId = childInstance[0].id;
    let isOld = !payload.newcomer;
    if (!Array.isArray(payload.newcomer)) {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = "Malformed newcomer data";
      return response;
    }
    if (
      !isOld &&
      payload.newcomer.find((el: string) => el === `${i + 1}`) === undefined
    )
      isOld = true;

    const shiftNr = parseInt(payload.shiftNr[i], 10);
    if (isNaN(shiftNr) || shiftNr < 1 || shiftNr > 5) {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = "Illegal shift number";
      return response;
    }

    const registrationEntry: regEntry = {
      regOrder: currentOrder,
      childId: childId,
      idCode: payload.idCode[i],
      shiftNr: shiftNr,
      isOld: isOld,
      birthday: parsedId.birthday,
      tsSize: payload.tsSize[i],
      addendum: payload.addendum[i] === "" ? null : payload.addendum[i],
      road: payload.road[i],
      city: payload.city[i],
      county: payload.county[i],
      country: payload.country[i],
      contactName: payload.contactName,
      contactNumber: payload.contactNumber,
      contactEmail: payload.contactEmail,
      backupTel: payload.backupTel ?? null,
      priceToPay: isOld
        ? meta.prices[shiftNr] - meta.priceDiff
        : meta.prices[shiftNr],
    };

    registrationEntries.push(registrationEntry);
  }

  const createdData = await Registration.bulkCreate(registrationEntries);
  // registrationEmitter.register(createdData).catch(console.error);
  sendEventsToAll(createdData).catch((e) => console.error(e));
  return response;
};

const sendEventsToAll = async (registrations: Registration[]) => {
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

  entries.forEach((entry) => {
    clients.forEach((client) => {
      const clientEntry = { ...entry };

      if (client.role === "op") {
        delete clientEntry.billNr;
        delete clientEntry.contactName;
        delete clientEntry.contactEmail;
        delete clientEntry.contactPhone;
        delete clientEntry.pricePaid;
        delete clientEntry.priceToPay;
        delete clientEntry.idCode;
      } else if (client.role !== "root") {
        delete clientEntry.idCode;
      }

      client.res.write(`data: ${JSON.stringify(clientEntry)}\n\n`);
    });
  });
};
