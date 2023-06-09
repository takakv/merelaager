import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { User } from "../db/models/User";

import { JWTUserTokenData, verifyAccessToken } from "../utilities/jwt";
import { UserShiftRole } from "../db/models/UserShiftRole";
import ShiftPermissionRoles = Express.ShiftPermissionRoles;

dotenv.config();

export const populateRequestingUser = async (
  req: Request,
  data: JWTUserTokenData
): Promise<boolean> => {
  // Fetch the user along with their permission group for each shift.
  const dbUser = await User.findByPk(data.userId, {
    attributes: ["id"],
    include: { model: UserShiftRole },
  });

  if (!dbUser) return false;

  // For each shift, only keep the permission group identifier.
  const shiftRoles: ShiftPermissionRoles = {};
  dbUser.shiftRoles.forEach((shiftRole: UserShiftRole): void => {
    shiftRoles[shiftRole.shiftNr] = shiftRole.roleId;
  });

  req.user = {
    userId: dbUser.id,
    shiftRoles: shiftRoles,
    isRoot: dbUser.role === "root",
  };
  return true;
};

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  // Fetch the JWT bearer token from the header.
  const token: string = authHeader.split(" ")[1];
  const decoded: JWTUserTokenData = verifyAccessToken(token);
  if (decoded === null) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  // Associate shift permission groups with the requesting user.
  // In theory, users should always exist, since tokens are only issued to
  // existing users.
  const isSuccess: boolean = await populateRequestingUser(req, decoded);
  if (!isSuccess) {
    console.log(`User with id ${decoded.userId} not found, but token is valid`);
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  next();
};

export default authenticate;
