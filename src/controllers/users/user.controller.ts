import { Request, Response } from "express";
import { ValidatedRequest } from "express-joi-validation";
import { StatusCodes } from "http-status-codes";

import { UpdateUserShiftParamsSchema } from "./user.types";

import { User } from "../../db/models/User";

export interface ShiftPermissionRoles {
  [key: number]: number;
}

export interface FrontEndUserData {
  name: string;
  isRoot: boolean;
  currentShift: number;
  role: number;
  shiftRoles: ShiftPermissionRoles;
}

export const fetchUserFrontEndInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId: number = req.user.userId;

  const dbUser: User = await User.findByPk(userId);

  const userData: FrontEndUserData = {
    name: dbUser.nickname,
    isRoot: req.user.isRoot,
    currentShift: dbUser.currentShift,
    role: req.user.shiftRoles[dbUser.currentShift],
    shiftRoles: req.user.shiftRoles,
  };

  res.json(userData);
};

export const updateUserShift = async (
  req: ValidatedRequest<UpdateUserShiftParamsSchema>,
  res: Response
): Promise<void> => {
  const userId: number = req.user.userId;
  const newShiftNr: number = req.params.shiftNr;

  if (!req.user.shiftRoles.hasOwnProperty(newShiftNr)) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  try {
    const dbUser: User = await User.findByPk(userId);
    dbUser.currentShift = newShiftNr;
    await dbUser.save();
  } catch (e) {
    console.error(e);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    return;
  }

  res.sendStatus(StatusCodes.NO_CONTENT);
};
