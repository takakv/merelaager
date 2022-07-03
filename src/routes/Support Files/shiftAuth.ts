import { NextFunction, Request, Response } from "express";
import { Staff } from "../../db/models/Staff";
import { User } from "../../db/models/User";
import Entity = Express.Entity;
import { UserLogEntry } from "../../logging/UserLogEntry";

// TODO: Implement integer-based role system for easier hierarchy management.

const requireShiftBoss = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { user } = req;

  if (user.isRoot) return next();

  const now = new Date();
  let year = now.getUTCFullYear();
  // Access updates happen in december.
  if (now.getMonth() === 11) ++year;

  const result = await Staff.findOne({
    where: { userId: user.id, shiftNr: user.shift, year },
  });
  if (!result) {
    console.log(
      `User '${user.username}' doesn't have rights to '${user.shift}v ${year}'`
    );
    return res.sendStatus(403);
  }

  const requiredRole = "boss";
  if (result.role !== requiredRole) {
    console.log(
      `User '${user.username}' must have a role of '${requiredRole}'`
    );
    return res.sendStatus(403);
  }
  next();
};

const approveShift = async (user: Entity, shiftNr: number) => {
  if (user.isRoot) return true;
  return user.shift === shiftNr;
};

const approveShiftFull = async (user: Entity, shiftNr: number) => {
  if (user.isRoot) return true;

  const userId = (await User.findOne({ where: { username: user.username } }))
    .id;
  const accessEntry = await Staff.findOne({
    where: { userId, shiftNr, year: new Date().getUTCFullYear() },
  });
  return !!accessEntry;
};

const approveRole = (user: Entity, role: string) => {
  if (user.isRoot) return true;
  return user.role === role;
};

export const userIsRoot = (user: Entity) => {
  return user.isRoot;
};

export const approveShiftRole = async (
  user: Entity,
  role: string,
  shiftNr: number,
  logObj: UserLogEntry
) => {
  if (user.isRoot) return true;

  const userId = user.id;
  const year = new Date().getUTCFullYear();
  const staffEntry = await Staff.findOne({
    where: { userId, shiftNr, year },
  });

  if (!staffEntry) {
    logObj.commit(false, `User not a member of shift: ${year}-${shiftNr}`);
    logObj.log();
    return false;
  }

  if (staffEntry.role === role) return true;

  logObj.commit(
    false,
    `User has role ${staffEntry.role}, but at least ${role} is required`
  );
  logObj.log();
  return false;
};

const approveShiftAndGetRole = async (user: Entity, shiftNr: number) => {
  if (user.isRoot) return "root";

  const userId = user.id;
  const staffEntry = await Staff.findOne({
    where: { userId, shiftNr, year: new Date().getUTCFullYear() },
  });

  if (!staffEntry) return null;
  return staffEntry.role;
};

module.exports = {
  approveRole,
  userIsRoot,
  approveShiftAndGetRole,
  requireShiftBoss,
  approveShift,
  approveShiftFull,
};
