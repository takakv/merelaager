import { Response } from "express";
import { ValidatedRequest } from "express-joi-validation";
import { StatusCodes } from "http-status-codes";

import { PatchRegistrationRequestSchema } from "./registration.types";
import Constants from "../../utils/constants";
import { approvePm } from "../../utils/permissionValidator";

import { Registration } from "../../db/models/Registration";
import { Permission } from "../../db/models/Permission";
import { Role } from "../../db/models/Role";
import { Child } from "../../db/models/Child";
import Entity = Express.Entity;

/**
 * Update a registration's values.
 * @param req
 * @param res
 */
export const patchRegistrationFunc = async (
  req: ValidatedRequest<PatchRegistrationRequestSchema>,
  res: Response
): Promise<void> => {
  const user: Entity = req.user;

  const regId: number = req.params.regId;

  const registration: Registration = await Registration.findByPk(regId);

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

  const permissions: Permission[] = await Permission.findAll({
    attributes: ["permissionName"],
    include: {
      model: Role,
      where: { id: user.shiftRoles[registration.shiftNr] },
    },
  });

  // From the web interface, the user cannot update multiple values at once
  // so no need to optimise permission validation.

  if (req.body.old !== undefined) {
    if (!approvePm(permissions, Constants.PERMISSION_EDIT_REG_STATUS)) {
      res.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }
    registration.isOld = req.body.old;
  }

  if (req.body.registered !== undefined) {
    if (!approvePm(permissions, Constants.PERMISSION_EDIT_REG_STATUS)) {
      res.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }

    // Do not allow "over-registering" campers.
    if (req.body.registered) {
      const gender: string = (
        await registration.$get("child", {
          attributes: ["gender"],
        })
      ).gender;

      const registrationCount: number = await Registration.count({
        where: {
          shiftNr: registration.shiftNr,
          isRegistered: true,
        },
        include: {
          model: Child,
          where: { gender },
        },
      });

      if (registrationCount >= 18) {
        res.sendStatus(StatusCodes.CONFLICT);
        return;
      }
    }

    registration.isRegistered = req.body.registered;
  }

  if (req.body.pricePaid !== undefined) {
    if (!approvePm(permissions, Constants.PERMISSION_EDIT_REG_STATUS)) {
      res.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }
    registration.pricePaid = req.body.pricePaid;
  }

  if (req.body.priceToPay !== undefined) {
    if (!approvePm(permissions, Constants.PERMISSION_EDIT_REG_STATUS)) {
      res.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }
    registration.priceToPay = req.body.priceToPay;
  }

  await registration.save();
  res.sendStatus(StatusCodes.NO_CONTENT);
};
