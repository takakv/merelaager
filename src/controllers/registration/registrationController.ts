import { Request, Response } from "express";
import sequelize from "sequelize";
import axios from "axios";
import dotenv from "dotenv";

import MailService from "../MailService";
import { Registration } from "../../db/models/Registration";
import { Child } from "../../db/models/Child";
import { RegistrationErrorResponse } from "./RegistrationResponse";
import { StatusCodes } from "http-status-codes";

dotenv.config();

const billGenerator = require("../billGenerator");

const meta = require("./meta");

const mailService: MailService = new MailService();

const DEBUG: boolean = false;

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

let billNumber = 0;
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
    availableSlots[i].M = meta.openSlots[i].M - regCounts[j++];
    availableSlots[i].F = meta.openSlots[i].F - regCounts[j++];
  }
};

const initializeBillNr = async () => {
  const previousBill = await Registration.findOne({
    order: [["billNr", "DESC"]],
  });
  if (previousBill) {
    billNumber = previousBill.billNr + 1;
  } else billNumber = 21001;
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

  await initializeBillNr();
  console.log(`First bill: ${billNumber}`);

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

const parser = require("./parser");

const fetchChild = async (name: string) => {
  // Case-insensitive name search.
  const child: Child = await Child.findOne({
    where: {
      name: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("name")),
        "LIKE",
        `%${name.toLowerCase()}%`
      ),
    },
  });

  return child ? child.id : null;
};

const addChild = async (name: string, gender: string) => {
  const child: Child = await Child.create({ name, gender });
  if (!child) {
    console.log(child);
    console.log("Error creating child");
    return null;
  }
  const res: Child = await Child.findOne({ where: { name } });
  if (!res) {
    console.log(res);
    console.log("Sanity check failed");
    return null;
  }
  return res.id;
};

const getGenders = (idCodeArray: string[]) => {
  const genders: string[] = [];
  idCodeArray.forEach((idCode) => {
    genders.push(idCode[0] === "5" ? "M" : "F");
  });
  return genders;
};

const postChildren = async (names: string[], genders: string[]) => {
  const childIds: number[] = [];

  for (let i = 0; i < names.length; ++i) {
    let childId = await fetchChild(names[i].trim());
    if (!childId) {
      childId = await addChild(names[i].trim(), genders[i]);
      if (!childId) return null;
    }
    childIds.push(childId);
  }
  return childIds;
};

const getChildData = (
  rawData,
  childIds,
  registrations,
  shiftNrs,
  i,
  billNr,
  regOrder
) => {
  let birthday;
  const idCode = rawData.idCode[i];

  if (idCode) {
    birthday = parser.validateIdCode(idCode).birthday;
  } else {
    birthday = rawData.bDay[i];
  }

  const isOld = rawData[`newAtCamp-${i + 1}`] !== "true";

  const isRegistered = registrations[i];
  const shiftNr = parseInt(shiftNrs[i].trim());

  return new Registration({
    childId: childIds[i],
    idCode,
    shiftNr,
    isRegistered,
    regOrder,
    isOld,
    birthday,
    tsSize: rawData.tsSize[i],
    addendum: rawData.addendum ? rawData.addendum[i] : null,
    road: rawData.road[i].trim(),
    city: rawData.city[i].trim(),
    county: rawData.county[i].trim(),
    country: rawData.country ? rawData.country[i].trim() : "Eesti",
    billNr: isRegistered ? billNr : null,
    contactName: rawData.contactName.trim(),
    contactEmail: rawData.contactEmail.trim(),
    contactNumber: rawData.contactNumber.trim(),
    backupTel: rawData.backupTel.trim(),
    priceToPay: getPrice(shiftNr, isOld),
  });
};

const prepRawData = (rawData) => {
  rawData.idCode = [rawData.idCode];
  rawData.isNew = [rawData.isNew];
  rawData.tsSize = [rawData.tsSize];
  rawData.addendum = [rawData.addendum];
  rawData.road = [rawData.road];
  rawData.city = [rawData.city];
  rawData.county = [rawData.county];
  rawData.country = [rawData.country];
  return rawData;
};

const getChildrenData = (
  childCount,
  rawData,
  childIds,
  registrations,
  shiftNrs,
  billNr,
  regOrder
) => {
  if (childCount === 1 && !Array.isArray(rawData.tsSize))
    rawData = prepRawData(rawData);

  const childrenData: Registration[] = [];

  for (let i = 0; i < childCount; ++i) {
    childrenData.push(
      getChildData(
        rawData,
        childIds,
        registrations,
        shiftNrs,
        i,
        billNr,
        regOrder
      )
    );
  }
  return childrenData;
};

const validateChildCount = (childCount: number, res: Response): boolean => {
  if (isNaN(childCount)) {
    const statusCode = 400;
    const error = new RegistrationErrorResponse(
      statusCode,
      "Could not parse the number of children"
    );
    res.status(statusCode).json(error.toJson());
    return false;
  }

  if (childCount < 1 || childCount > 4) {
    const statusCode = 400;
    const error = new RegistrationErrorResponse(
      statusCode,
      "Invalid number of children"
    );
    res.status(statusCode).json(error.toJson());
    return false;
  }

  return true;
};

const validateUnlock = (res: Response): boolean => {
  if (unlocked) return true;

  const statusCode = 403;
  const error = new RegistrationErrorResponse(statusCode, "Too early");
  res.json(error.toJson());

  return false;
};

const getContentArrays = (req: Request) => {
  let shiftNrs: number[];
  let genders: string[];
  let names: string[];

  if (Array.isArray(req.body.shiftNr)) {
    shiftNrs = req.body.shiftNr;
    genders = getGenders(req.body.idCode);
    names = req.body.name;
  } else {
    shiftNrs = [req.body.shiftNr];
    genders = getGenders([req.body.idCode]);
    names = [req.body.name];
  }

  return { shiftNrs, genders, names };
};

const registerAll = async (req: Request, res: Response): Promise<void> => {
  if (!validateUnlock(res)) return;

  const childCount = parseInt(req.body.childCount);
  if (!validateChildCount(childCount, res)) return;

  const order = registrationOrder++;
  console.log(`Registration: ${order} at ${Date.now()}`);

  // Determine how many children need to be registered,
  // their gender and desired shift to lock the slots.

  // First determine genders, shifts, and names.
  // Names will be needed later.
  let { shiftNrs, genders, names } = getContentArrays(req);

  if (DEBUG) {
    console.log(`Shifts: ${shiftNrs}`);
    console.log(`Genders: ${genders}`);
  }

  // Sanity check.
  if (shiftNrs.length !== genders.length || shiftNrs.length !== names.length) {
    const statusCode = 400;
    const error = new RegistrationErrorResponse(
      statusCode,
      "Uneven parameter lengths"
    );
    res.status(statusCode).json(error.toJson());
    return;
  }

  // Immediately lock the available slots,
  // store whether there was room or not.
  const isRegistered: boolean[] = [];

  let regCount = 0;
  for (let i = 0; i < childCount; ++i) {
    if (availableSlots[shiftNrs[i]][genders[i]] > 0) {
      isRegistered.push(true);
      ++regCount;
      --availableSlots[shiftNrs[i]][genders[i]];
    } else isRegistered.push(false);
  }

  axios.post(process.env.URL, availableSlots).catch((e) => console.error(e));

  // Keep track of registration bill order.
  const billNr = regCount ? billNumber++ : null;

  if (DEBUG) console.log(`RegStatus: ${isRegistered}`);

  // Commit children into the database.
  const childIds = await postChildren(names, genders);

  if (DEBUG) console.log(`ChildIds: ${childIds}`);

  // Fetch data regarding the children.
  const childrenData = getChildrenData(
    childCount,
    req.body,
    childIds,
    isRegistered,
    shiftNrs,
    billNr,
    order
  );

  if (!childrenData.length) {
    res.sendStatus(400);
    return;
  }

  if (DEBUG) {
    console.log("ChildrenData:");
    console.log(childrenData);
  }

  const bulkValues = childrenData.map((child) =>
    child.getRegistrationProperties()
  );
  await Registration.bulkCreate(bulkValues);

  const contact = {
    name: childrenData[0].contactName,
    email: childrenData[0].contactEmail,
  };

  if (regCount) {
    // res.sendStatus(200);
    res.redirect("../edu/");
    const billName = await billGenerator.generatePDF(
      childrenData,
      names,
      contact,
      billNr,
      regCount
    );

    // console.log("PDF generated");
    if (req.body.noEmail) return;

    try {
      await mailer(childrenData, names, contact, billName, regCount, billNr);
    } catch (e) {
      console.error(e);
    }
  } else {
    // res.sendStatus(200);
    res.redirect("../reserv/");
    if (req.body.noEmail) return;
    try {
      await mailService.sendFailureMail(childrenData, contact);
    } catch (e) {
      console.error(e);
    }
  }
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
    console.log(req.body);
    const response = await newRegister(req.body);
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
  newcomer?: string | string[];
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
  if (childCount < 1 || childCount > 4) {
    response.ok = false;
    response.code = StatusCodes.BAD_REQUEST;
    response.message = "Illegal number of children";
    return response;
  }

  const requiredKeys = [
    "name",
    "shiftNr",
    "tsSize",
    "road",
    "city",
    "county",
    "country",
    "addendum",
    "contactName",
    "contactNumber",
    "contactEmail",
  ];

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
    // TODO: implement seniority check
    const isOld = false;

    const shiftNr = parseInt(payload.shiftNr[i], 10);
    if (isNaN(shiftNr) || shiftNr < 1 || shiftNr > 5) {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = "Illegal shift number";
      return response;
    }

    // TODO: implement price calculation
    // TODO: implement checking of all entries

    const registrationEntry: regEntry = {
      regOrder: 0,
      childId: childId,
      idCode: payload.idCode[i],
      shiftNr: parseInt(payload.shiftNr[i]),
      isOld: isOld,
      birthday: parsedId.birthday,
      tsSize: payload.tsSize[i],
      addendum: payload.addendum[i],
      road: payload.road[i],
      city: payload.city[i],
      county: payload.county[i],
      country: payload.country[i],
      contactName: payload.contactName,
      contactNumber: payload.contactNumber,
      contactEmail: payload.contactEmail,
      backupTel: payload.backupTel,
      priceToPay: 0,
    };

    registrationEntries.push(registrationEntry);
  }

  await Registration.bulkCreate(registrationEntries);
  return response;
};

const mailer = async (campers, names, contact, pdfName, regCount, billNr) => {
  return mailService.sendConfirmationMail(
    campers,
    names,
    contact,
    calculatePrice(campers),
    pdfName,
    regCount,
    billNr
  );
};

const getPrice = (shiftNr: number, isOld: boolean) => {
  let price: number = meta.prices[shiftNr];
  if (isOld) price -= 20;
  return price;
};

const calculatePrice = (regList) => {
  let price = 0;
  regList.forEach((camper) => {
    if (!camper.isRegistered) return;
    price += getPrice(camper.shiftNr, camper.isOld);
  });
  return price;
};
