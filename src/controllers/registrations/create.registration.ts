import type { Response } from "express";
import type { ValidatedRequest } from "express-joi-validation";
import { StatusCodes } from "http-status-codes";
import sequelize from "sequelize";
import type {
  CreateRegistrationRequestSchema,
  EmailReceiptInfo,
  RegistrationDbEntry,
} from "./registration.types";
import { Child } from "../../db/models/Child";
import GlobalStore from "../../utilities/GlobalStore";
import { Registration } from "../../db/models/Registration";

const validateDate = (year: number, month: number, date: number) => {
  if (month < 0 || month > 11 || date < 0) return false;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return date <= daysInMonth;
};

const parseIdCode = (code: string) => {
  if (code.length !== 11 || !/^\d+$/.test(code)) {
    return { error: "ID code must be 11 digits long" };
  }

  if (code[0] !== "5" && code[0] !== "6") {
    return { error: "Child's ID code must start with 5 or 6" };
  }
  const birthYear = parseInt(`20${code[1]}${code[2]}`, 10);
  const birthMonth = parseInt(`${code[3]}${code[4]}`, 10);
  const birthDate = parseInt(`${code[5]}${code[6]}`, 10);

  // Month for the Date constructor.
  const birthMonthIndex = birthMonth - 1;

  if (!validateDate(birthYear, birthMonthIndex, birthDate)) {
    return { error: "ID code does not contain a valid date of birth" };
  }

  const dob = new Date(Date.UTC(birthYear, birthMonthIndex, birthDate));

  // TODO: check the ID code checksum.
  // Counterpoint: on rare occasions, legal ID codes have invalid checksums.

  const sex = code[0] === "5" ? "M" : "F";
  return { sex, dob };
};

type JSendData = {
  [key: string]: any;
} | null;

type JSendSuccess = {
  status: "success";
  data: JSendData;
};

type JSendFail = {
  status: "fail";
  data: JSendData;
};

interface JSendErrorData {
  message: string;
  code?: number;
  data?: JSendData;
}

interface JSendError extends JSendErrorData {
  status: "error";
}

type JSendResponse = JSendSuccess | JSendFail | JSendError;

/**
 * Record camper registrations.
 * @param req
 * @param res
 */
export const createRegistrationsFunc = async (
  req: ValidatedRequest<CreateRegistrationRequestSchema>,
  res: Response,
) => {
  const { body } = req;

  const resObj = <JSendResponse>{
    status: "success",
    data: null,
  };

  const maxEntries = 8;
  if (req.body.length > maxEntries) {
    resObj.status = "fail";
    resObj.data = {
      registrations: `The number of entries must not exceed ${maxEntries}`,
    };
    res.status(StatusCodes.BAD_REQUEST).json(resObj);
    return;
  }

  // Keep track of the relative order of registrations.
  // Order numbers are wasted if the registration fails (e.g. the request is malformed)
  // but this is not a problem for the current use case, and it avoids looping twice.
  const currentOrder = GlobalStore.registrationOrder;
  ++GlobalStore.registrationOrder;

  const registrationEntries: RegistrationDbEntry[] = [];

  // Helpers for email receipts.
  const camperBasicInfo: EmailReceiptInfo[] = [];
  const registrationEmailChoices: boolean[] = [];

  for (const [index, entry] of body.entries()) {
    let { sex, dob } = entry;

    // The ID code takes priority over explicit sex and birthday info.
    if (entry.idCode) {
      const parsedData = parseIdCode(entry.idCode);
      if (parsedData.error) {
        resObj.status = "fail";
        resObj.data = {};
        resObj.data[`[${index}].idCode`] = parsedData.error;

        res.status(StatusCodes.BAD_REQUEST).json(resObj);
        return;
      }

      // Override the sex and birthday info even if set.
      sex = parsedData.sex;
      dob = parsedData.dob;
    } else if (sex === undefined || dob === undefined) {
      // These should not be undefined since the request body has been validated.
      // But check in any case.
      resObj.status = "fail";
      resObj.data = {};
      if (!sex) resObj.data[`[${index}].sex`] = "property is required";
      if (!dob) resObj.data[`[${index}].dob`] = "property is required";

      res.status(StatusCodes.BAD_REQUEST).json(resObj);
      return;
    }

    const childName = entry.name.trim();

    // Check if the child already exists in the database.
    // There is a small chance that two children will share the same name, but this
    // has not happened yet and is unlikely to happen. Once it happens once, the logic
    // will have to be changed, however.
    const [childInstance, _] = await Child.findOrCreate({
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

    const registrationEntry: RegistrationDbEntry = {
      regOrder: currentOrder,
      childId: childInstance.id,
      idCode: entry.idCode || null,
      shiftNr: entry.shiftNr,
      isOld: !entry.isNew,
      birthday: dob,
      tsSize: entry.shirtSize,
      addendum: entry.addendum?.trim() || null,
      road: entry.road.trim(),
      city: entry.city.trim(),
      county: entry.county.trim(),
      country: entry.country.trim(),
      contactName: entry.contactName.trim(),
      contactNumber: entry.contactNumber.trim(),
      contactEmail: entry.contactEmail.trim(),
      backupTel: entry.backupTel?.trim() || null,
      priceToPay: 0,
    };

    registrationEntries.push(registrationEntry);
    camperBasicInfo.push({
      name: entry.name,
      shiftNr: entry.shiftNr,
      contactEmail: entry.contactEmail,
    });
    registrationEmailChoices.push(entry.sendEmail ?? false);
  }

  let registrationIds: number[] = [];

  try {
    const createdData = await Registration.bulkCreate(registrationEntries);
    registrationIds = createdData.map((entry) => entry.id);
  } catch (err) {
    console.error(err);
    const resErrObj = <JSendResponse>{
      status: "error",
      message: "Error communicating with database",
    };
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(resErrObj);
  }

  resObj.data = { registrationIds };
  res.status(StatusCodes.CREATED).json(resObj);

  if (registrationEmailChoices.includes(true)) {
    sendRegistrationEmails(camperBasicInfo, registrationEmailChoices);
  }
};

const sendRegistrationEmails = (
  registrations: EmailReceiptInfo[],
  emailChoices: boolean[],
) => {
  // Group children by email.
  const childContacts: {
    [key: string]: EmailReceiptInfo[];
  } = {};

  for (const [index, registration] of registrations.entries()) {
    if (!emailChoices[index]) continue;

    const { contactEmail } = registration;
    if (!(contactEmail in childContacts)) {
      childContacts[contactEmail] = [registration];
    } else {
      childContacts[contactEmail].push(registration);
    }
  }

  for (const [email, entries] of Object.entries(childContacts)) {
    GlobalStore.mailService
      .sendRegistrationReceipt(entries, email)
      .catch((err) => {
        console.error(err);
        console.log(`Email was:`, email);
      });
    console.log(entries);
  }
};
