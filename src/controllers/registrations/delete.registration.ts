import { Response } from "express";
import { ValidatedRequest } from "express-joi-validation";
import { StatusCodes } from "http-status-codes";

import { Registration } from "../../db/models/Registration";
import { Permission } from "../../db/models/Permission";
import { Role } from "../../db/models/Role";

import Constants from "../../utils/constants";
import { DeleteRegistrationRequestSchema } from "./registration.types";
import Entity = Express.Entity;

/**
 * Delete a registration.
 * @param req
 * @param res
 */
export const deleteShiftRegistrationFunc = async (
  req: ValidatedRequest<DeleteRegistrationRequestSchema>,
  res: Response
): Promise<void> => {
  const user: Entity = req.user;

  const { regId } = req.params;

  const registration = await Registration.findByPk(regId, {
    attributes: ["id", "shiftNr", "isRegistered"],
  });

  // Do not leak whether a registration entry with this ID exists.
  if (!registration) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  // User has no role for this shift.
  if (!user.shiftRoles.hasOwnProperty(registration.shiftNr)) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  const deletePermission = await Permission.findAll({
    where: { permissionName: Constants.PERMISSION_DELETE_REG },
    attributes: ["permissionName"],
    include: [
      {
        model: Role,
        where: { id: user.shiftRoles[registration.shiftNr] },
      },
    ],
  });

  // User does not have the delete permission.
  if (!deletePermission) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  // Do not allow deletion of registered children.
  // Always require unregistering before an entry can be deleted.
  if (registration.isRegistered) {
    res.sendStatus(StatusCodes.CONFLICT);
    return;
  }

  await registration.destroy();
  res.sendStatus(StatusCodes.NO_CONTENT);
};
