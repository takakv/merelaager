import { Request, Response } from "express";
import sequelize from "sequelize";
import dotenv from "dotenv";

import { Registration } from "../../db/models/Registration";
import { Child } from "../../db/models/Child";
import { StatusCodes } from "http-status-codes";
import { registrationTracker } from "../../channels/registrationTracker";
import MailService from "../MailService";

dotenv.config();

import {
  eta,
  registrationPriceDiff,
  registrationPrices,
  unlockTime,
} from "./meta";

const maxBatchRegistrations = 4;

let unlocked: boolean = process.env.NODE_ENV === "dev";

if (process.env.UNLOCK === "true") {
  unlocked = true;
} else if (process.env.NODE_ENV === "prod") {
  setTimeout(() => {
    unlocked = true;
  }, eta);
}

let registrationOrder = 1;
const mailService = new MailService();

const initializeRegistrationOrder = async () => {
  const prevReg = await Registration.findOne({
    order: [["regOrder", "DESC"]],
    attributes: ["regOrder"],
  });
  if (prevReg) registrationOrder = prevReg.regOrder + 1;
};

export const initialiseRegistration = async () => {
  await initializeRegistrationOrder();
  console.log(`Reg order: ${registrationOrder}`);

  console.log(`Registration is unlocked? ${unlocked}`);
  console.log(
    `Unlock date: ${unlockTime.toLocaleString("en-GB", {
      timeZone: "Europe/Tallinn",
    })} (Estonian time)`
  );
  console.log(`Unlock delta: ${eta}`);
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
    const response = await registerCampers(req.body);
    if (!response.ok) {
      console.log(req.body);
      console.log(response);
    }
    if (response.ok) return res.redirect("../registreerimine/reserv/");
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
  "newcomer-1": string;
  "newcomer-2": string;
  "newcomer-3": string;
  "newcomer-4": string;
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

const registerCampers = async (payloadData: unknown) => {
  const currentOrder = registrationOrder;
  ++registrationOrder;

  const payload = payloadData as payload;

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
      payload[key].length > maxBatchRegistrations
    ) {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = `Property '${key}' is malformed or missing`;
      return response;
    }
  }

  /*if (!Array.isArray(payload.newcomer)) {
    response.ok = false;
    response.code = StatusCodes.BAD_REQUEST;
    response.message = "Newcomer data malformed or missing";
    return response;
  }*/

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
    const [childInstance, created] = await Child.findOrCreate({
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

    const childId = childInstance.id;
    let isOld = !created;
    if (!payload.hasOwnProperty(`newcomer-${i + 1}`)) {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = "Newcomer data malformed or missing";
      return response;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    isOld = payload[`newcomer-${i + 1}`] !== "yes";

    const shiftNr = parseInt(payload.shiftNr[i], 10);
    if (isNaN(shiftNr) || shiftNr < 1 || shiftNr > 4) {
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      priceToPay: isOld
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          registrationPrices[shiftNr] - registrationPriceDiff
        : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          registrationPrices[shiftNr],
    };

    registrationEntries.push(registrationEntry);
  }
  const createdData = await Registration.bulkCreate(registrationEntries);
  // Broadcast separately to ease parsing on client side.
  createdData.forEach((entry) => {
    registrationTracker.broadcast(
      JSON.stringify({ id: entry.id }),
      "registration-created"
    );
  });
  try {
    await mailService.sendFailureMail(registrationEntries, {
      name: payload.contactName,
      email: payload.contactEmail,
    });
  } catch (e) {
    console.error(e);
  }
  return response;
};
