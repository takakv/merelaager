import { Response } from "express";
import { ValidatedRequest } from "express-joi-validation";
import { StatusCodes } from "http-status-codes";

import { ShiftRegistrationRequestSchema } from "./registration.types";
import Constants from "../../utils/constants";
import { PrintEntry } from "../../routes/Support Files/registrations";
import { generatePDF } from "../listGenerator";

import { Permission } from "../../db/models/Permission";
import { Role } from "../../db/models/Role";
import { Registration } from "../../db/models/Registration";
import { Child } from "../../db/models/Child";
import Entity = Express.Entity;

/**
 * Fetch the PDF list of registrations for a given shift.
 * @param req
 * @param res
 */
export const fetchShiftRegistrationsPdfFunc = async (
  req: ValidatedRequest<ShiftRegistrationRequestSchema>,
  res: Response
): Promise<void> => {
  const user: Entity = req.user;
  const shiftNr: number = req.params.shiftNr;

  // User has no role for this shift.
  if (!user.shiftRoles.hasOwnProperty(shiftNr)) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  const permissions: Permission[] = await Permission.findAll({
    attributes: ["permissionName"],
    include: {
      model: Role,
      where: { id: user.shiftRoles[shiftNr] },
    },
  });

  const hasViewPerms =
    permissions.find(
      (permission: Permission) =>
        permission.permissionName === Constants.PERMISSION_VIEW_REG_BASIC
    ) !== undefined &&
    permissions.find(
      (permission: Permission) =>
        permission.permissionName === Constants.PERMISSION_VIEW_REG_CONTACT
    ) !== undefined;

  if (
    !hasViewPerms &&
    !permissions.find(
      (permission: Permission) =>
        permission.permissionName === Constants.PERMISSION_VIEW_REG_FULL
    )
  ) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  const dbRegistrations: Registration[] = await Registration.findAll({
    where: { shiftNr, isRegistered: true },
    include: { model: Child, order: [["name", "ASC"]] },
  });

  if (!dbRegistrations) {
    res.sendStatus(StatusCodes.NOT_FOUND);
    return;
  }

  const entries: PrintEntry[] = [];

  dbRegistrations.forEach((registration: Registration) => {
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

  const pdfName: string = await generatePDF(shiftNr, entries);
  if (!pdfName) {
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    return;
  }

  res.sendFile(pdfName, { root: "./data/files" });
};
