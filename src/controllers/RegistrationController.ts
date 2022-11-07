import dotenv from "dotenv";
import { Request } from "express";
import { Registration } from "../db/models/Registration";
import { Child } from "../db/models/Child";
import {
  PrintEntry,
  RegistrationEntry,
} from "../routes/Support Files/registrations";
import { ShiftData } from "../db/models/ShiftData";
import { StatusCodes } from "http-status-codes";

import { generatePDF } from "./listGenerator";
import { userIsRoot } from "../routes/Support Files/shiftAuth";
import { Permission } from "../db/models/Permission";
import Entity = Express.Entity;
import { Op } from "sequelize";
import { permissionsList } from "../utilities/permissionsList";
import AccessController from "./AccessController";

dotenv.config();

type registrationResponse = {
  ok: boolean;
  code: number;
  message: string;
  payload?: RegistrationEntry;
};

type pdfResponse = {
  ok: boolean;
  code: number;
  message?: string;
  filename?: string;
};

class RegistrationController {
  /**
   * Fetches all registrations the user has view access to.
   * @param {Request} req - The HTTP request object
   * @returns {RegistrationEntry[]} A list of all viewable registration entries
   */
  static fetchRegistrations = async (req: Request) => {
    const userShiftPermissions =
      await AccessController.getViewPermissionsForAllShifts(
        req.user.id,
        permissionsList.reg.view.permissionName
      );

    const registrations: RegistrationEntry[] = [];

    if (!userShiftPermissions.length) return registrations;

    const camperRegistrations = await Registration.findAll({
      order: [["regOrder", "ASC"]],
      include: Child,
      where: {
        [Op.or]: userShiftPermissions.map((entry) => ({
          ["shiftNr"]: entry.shiftNr,
        })),
      },
    });

    if (!camperRegistrations.length) return registrations;

    camperRegistrations.forEach((registration) => {
      const entry = this.#prepareRegistrationEntry(
        registration,
        userShiftPermissions.find(
          (entry) => registration.shiftNr === entry.shiftNr
        ).permissions
      );
      registrations.push(entry);
    });

    return registrations;
  };

  /**
   * Fetches a particular registration using the registration identifier.
   * @param {Request} req - The HTTP request object
   * @param {number} regId - The registration identifier
   * @returns {registrationResponse} The response object containing the registration entry on success,
   * or an error message on failure
   */
  static fetchRegistration = async (req: Request, regId: number) => {
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
      include: Child,
    });
    if (!registration) {
      response.ok = false;
      response.code = StatusCodes.NOT_FOUND;
      response.message = "Unknown registration identifier";
      return response;
    }

    const userPermissions = await AccessController.getViewPermissionsForShift(
      req.user.id,
      registration.shiftNr,
      permissionsList.reg.view.permissionName
    );

    if (userPermissions === null) {
      response.ok = false;
      response.code = StatusCodes.FORBIDDEN;
      response.message = "Insufficient rights to access content";
      return response;
    }

    response.payload = this.#prepareRegistrationEntry(
      registration,
      userPermissions
    );
    return response;
  };

  /**
   * Generates a PDF list of registrations for a shift.
   * @param {Entity} user - The requesting user
   * @param {number} shiftNr - The identifier of the requested shift
   * @returns {pdfResponse} The response object containing either the generated PDF file name,
   * or error information on failure
   */
  static printShiftRegistrationsList = async (
    user: Entity,
    shiftNr: number
  ) => {
    const response: pdfResponse = {
      ok: true,
      code: StatusCodes.OK,
      message: "",
    };

    const userPermissions = await AccessController.getViewPermissionsForShift(
      user.id,
      shiftNr,
      permissionsList.reg.view.permissionName
    );

    if (
      userPermissions === null ||
      userPermissions[0].extent < permissionsList.reg.view.contact
    ) {
      response.ok = false;
      response.code = StatusCodes.FORBIDDEN;
      response.message = "Insufficient rights to access content";
      return response;
    }

    const registrations = await Registration.findAll({
      where: { shiftNr, isRegistered: true },
      include: { model: Child, order: [["name", "ASC"]] },
    });

    if (!registrations) {
      response.ok = false;
      response.code = StatusCodes.NO_CONTENT;
      return response;
    }

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

    response.filename = await generatePDF(shiftNr, entries);
    return response;
  };

  /**
   * Selects the registration information fields according to the viewing permissions of the requesting user.
   * @param {Registration} data - The registration entry
   * @param {Permission[]} permissions - The sorted list of view permissions
   * @returns {RegistrationEntry} The prepared entry
   */
  static #prepareRegistrationEntry = (
    data: Registration,
    permissions: Permission[]
  ) => {
    const accessExtent = permissions[0].extent;

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
    };

    if (accessExtent >= permissionsList.reg.view.contact) {
      entry.billNr = data.billNr;
      entry.contactName = data.contactName;
      entry.contactEmail = data.contactEmail;
      entry.contactPhone = data.contactNumber;
      entry.pricePaid = data.pricePaid;
      entry.priceToPay = data.priceToPay;
    }

    if (accessExtent >= permissionsList.reg.view.full)
      entry.idCode = data.idCode;
    return entry;
  };
}

export default RegistrationController;

const verifyPrice = (price: string) => {
  const amount = parseInt(price, 10);
  return !isNaN(amount);
};

const updateData = async (registration: Registration) => {
  const { shiftNr } = registration;

  const child = await Child.findOne({
    where: { id: registration.childId },
  });

  const [entry, created] = await ShiftData.findOrCreate({
    where: { childId: child.id, shiftNr },
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
    response.message = "Insufficient rights to access content";
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
