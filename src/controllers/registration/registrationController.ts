import { Request, Response } from "express";
import sequelize from "sequelize";
import dotenv from "dotenv";

import { Registration } from "../../db/models/Registration";
import { Child } from "../../db/models/Child";
import { StatusCodes } from "http-status-codes";
import { registrationTracker } from "../../channels/registrationTracker";
import { registrationPriceDiff, registrationPrices } from "./meta";
import GlobalStore from "../../utilities/GlobalStore";

dotenv.config();

const maxBatchRegistrations = 4;

const parseIdCode = (code: string) => {
  if (code.length !== 11) return null;
  if (code[0] !== "5" && code[0] !== "6") return null;

  const sex = code[0] === "5" ? "M" : "F";

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

  return { gender: sex, birthday };
};

export const create = async (req: Request, res: Response) => {
  console.log("I am creating a set of registrations");
  console.log(req.body);

  try {
    const response = await registerCampers(req.body);
    if (!response.ok) {
      console.log(req.body);
      console.log(response);
    }
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

type RegChildInfo = {
  name: string;
  idCode: string;
  shift: number;
  shirtSize: string;
  road: string;
  city: string;
  county: string;
  country: string;
  addendum: string;
  isNew: boolean;
  sex: string;
  dob: string;
  useIdCode: boolean;
};

type RegPayload = {
  children: RegChildInfo[];
  contactName: string;
  contactEmail: string;
  contactNumber: string;
  backupTel: string;
};

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
  const currentOrder = GlobalStore.registrationOrder;
  ++GlobalStore.registrationOrder;

  const payload = payloadData as RegPayload;

  const response = {
    ok: true,
    code: StatusCodes.CREATED,
    message: "",
  };

  if (!GlobalStore.registrationUnlocked) {
    response.ok = false;
    response.code = StatusCodes.FORBIDDEN;
    response.message = "Registration not open";
    return response;
  }

  const childCount = payload.children.length;
  if (childCount < 1 || childCount > maxBatchRegistrations) {
    response.ok = false;
    response.code = StatusCodes.BAD_REQUEST;
    response.message = "Illegal number of children";
    return response;
  }

  type ChildObjectKey = keyof RegChildInfo;
  type PayloadObjectKey = keyof RegPayload;

  const arrayKeys: ChildObjectKey[] = [
    "name",
    "idCode",
    "shift",
    "shirtSize",
    "road",
    "city",
    "county",
    "country",
    "addendum",
    "isNew",
    "sex",
    "dob",
    "useIdCode",
  ];

  /*
                                                for (const key of arrayKeys) {
                                                  if (
                                                    !payload.hasOwnProperty(key) ||
                                                    !Array.isArray(payload.children[0][key]) ||
                                                    payload[key].length > maxBatchRegistrations
                                                  ) {
                                                    response.ok = false;
                                                    response.code = StatusCodes.BAD_REQUEST;
                                                    response.message = `Property '${key}' is malformed or missing`;
                                                    return response;
                                                  }
                                                }
                                                 */

  const stringKeys: PayloadObjectKey[] = [
    "contactName",
    "contactNumber",
    "contactEmail",
    "backupTel",
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
    const childData = payload.children[i];

    const parsedId = parseIdCode(childData.idCode.trim());
    if (!parsedId) {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = "ID code not properly formatted";
      return response;
    }

    const sex = childData.useIdCode ? parsedId.gender : childData.sex;
    const birthday = childData.useIdCode
      ? parsedId.birthday
      : new Date(childData.dob);

    const childName = childData.name.trim();
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
        "%" + childName.toLowerCase() + "%",
      ),
      attributes: ["id"],
      defaults: {
        name: childName,
        gender: sex,
      },
    });

    const childId = childInstance.id;
    let isOld = !childData.isNew;
    if (!isOld && !created) isOld = true;

    const shiftNr = childData.shift;
    if (isNaN(shiftNr) || shiftNr < 1 || shiftNr > 4) {
      response.ok = false;
      response.code = StatusCodes.BAD_REQUEST;
      response.message = "Illegal shift number";
      return response;
    }

    const registrationEntry: regEntry = {
      regOrder: currentOrder,
      childId: childId,
      idCode: childData.idCode,
      shiftNr: shiftNr,
      isOld: isOld,
      birthday: birthday,
      tsSize: childData.shirtSize,
      addendum: childData.addendum === "" ? null : childData.addendum,
      road: childData.road,
      city: childData.city,
      county: childData.county,
      country: childData.country,
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
      "registration-created",
    );
  });
  /*
      try {
        await GlobalStore.mailService.sendFailureMail(registrationEntries, {
          name: payload.contactName,
          email: payload.contactEmail,
        });
      } catch (e) {
        console.error(e);
        console.log(`Email was: ${payload.contactEmail}`);
      }
      */
  return response;
};
