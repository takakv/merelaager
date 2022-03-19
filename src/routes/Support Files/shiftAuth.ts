import { NextFunction, Request, Response } from "express";
import { Staff } from "../../db/models/Staff";
import { User } from "../../db/models/User";
import Entity = Express.Entity;

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

const approveRole = async (user: Entity, role: string) => {
  if (user.isRoot) return true;
  return user.role === role;
};

const requireRoot = async (user: Entity) => {
  return user.isRoot;
};

const approveShiftRole = async (
  user: Entity,
  role: string,
  shiftNr: number
) => {
  if (user.isRoot) return true;

  const userId = user.id;
  const staffEntry = await Staff.findOne({
    where: { userId, shiftNr, year: new Date().getUTCFullYear() },
  });

  if (!staffEntry) return false;
  return staffEntry.role === role;
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
  requireRoot,
  approveShiftRole,
  approveShiftAndGetRole,
  requireShiftBoss,
  approveShift,
  approveShiftFull,
};
