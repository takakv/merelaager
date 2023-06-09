import { Request, Response } from "express";
import { ValidatedRequest } from "express-joi-validation";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";

import { RegistrationEntry } from "../../routes/Support Files/registrations";
import {
  FetchRegistrationRequestSchema,
  ShiftRegistrationRequestSchema,
} from "./registration.types";
import Constants from "../../utils/constants";

import { Registration } from "../../db/models/Registration";
import { Child } from "../../db/models/Child";
import { Permission } from "../../db/models/Permission";
import { Role } from "../../db/models/Role";
import Entity = Express.Entity;

const prepareRegistrationEntry = (
  data: Registration,
  permissions: Permission[]
): RegistrationEntry => {
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

  if (
    permissions.find(
      (permission: Permission) =>
        permission.permissionName === Constants.PERMISSION_VIEW_REG_FULL
    )
  ) {
    entry.contactName = data.contactName;
    entry.contactEmail = data.contactEmail;
    entry.contactPhone = data.contactNumber;
    entry.billNr = data.billNr;
    entry.pricePaid = data.pricePaid;
    entry.priceToPay = data.priceToPay;
    return entry;
  }

  if (
    permissions.find(
      (permission: Permission) =>
        permission.permissionName === Constants.PERMISSION_VIEW_REG_CONTACT
    )
  ) {
    entry.contactName = data.contactName;
    entry.contactEmail = data.contactEmail;
    entry.contactPhone = data.contactNumber;
  }

  if (
    permissions.find(
      (permission: Permission) =>
        permission.permissionName === Constants.PERMISSION_VIEW_REG_PRICE
    )
  ) {
    entry.billNr = data.billNr;
    entry.pricePaid = data.pricePaid;
    entry.priceToPay = data.priceToPay;
  }

  return entry;
};

/**
 * Fetch authorised registration information for a specific registration.
 * @param req
 * @param res
 */
export const fetchRegistrationFunc = async (
  req: ValidatedRequest<FetchRegistrationRequestSchema>,
  res: Response
): Promise<void> => {
  const user: Entity = req.user;

  const { regId } = req.params;

  const dbRegistration = await Registration.findByPk(regId, {
    include: {
      model: Child,
      attributes: ["name"],
    },
  });

  // Do not leak whether a registration entry with this ID exists.
  if (!dbRegistration) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  // User has no role for this shift.
  if (!user.shiftRoles.hasOwnProperty(dbRegistration.shiftNr)) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  const permissions = await Permission.findAll({
    attributes: ["permissionName"],
    include: {
      model: Role,
      where: { id: user.shiftRoles[dbRegistration.shiftNr] },
    },
  });

  const registration: RegistrationEntry = prepareRegistrationEntry(
    dbRegistration,
    permissions
  );

  res.json(registration);
};

/**
 * Fetch authorised registration information for all authorised shifts.
 * @param req
 * @param res
 */
export const fetchRegistrationsFunc = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user: Entity = req.user;
  const registrations: RegistrationEntry[] = [];

  if (Object.keys(user.shiftRoles).length === 0) {
    res.json(registrations);
    return;
  }

  const dbRegistrations = await Registration.findAll({
    order: [["regOrder", "ASC"]],
    include: Child,
    where: {
      shiftNr: {
        [Op.in]: Object.keys(user.shiftRoles),
      },
    },
  });

  for (const registration of dbRegistrations) {
    // TODO: preload for efficiency
    const permissions = await Permission.findAll({
      attributes: ["permissionName"],
      include: {
        model: Role,
        where: { id: user.shiftRoles[registration.shiftNr] },
      },
    });

    const entry: RegistrationEntry = prepareRegistrationEntry(
      registration,
      permissions
    );
    registrations.push(entry);
  }

  res.json(registrations);
};

/**
 * Fetch authorised registration information for a specific shift.
 * @param req
 * @param res
 */
export const fetchShiftRegistrationsFunc = async (
  req: ValidatedRequest<ShiftRegistrationRequestSchema>,
  res: Response
): Promise<void> => {
  const user: Entity = req.user;
  const registrations: RegistrationEntry[] = [];

  const { shiftNr } = req.params;

  // User has no role for this shift.
  if (!user.shiftRoles.hasOwnProperty(shiftNr)) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  const permissions = await Permission.findAll({
    attributes: ["permissionName"],
    include: {
      model: Role,
      where: { id: user.shiftRoles[shiftNr] },
    },
  });

  const dbRegistrations = await Registration.findAll({
    order: [["regOrder", "ASC"]],
    include: Child,
    where: {
      shiftNr: {
        [Op.in]: Object.keys(user.shiftRoles),
      },
    },
  });

  for (const registration of dbRegistrations) {
    const entry: RegistrationEntry = prepareRegistrationEntry(
      registration,
      permissions
    );
    registrations.push(entry);
  }

  res.json(registrations);
};
