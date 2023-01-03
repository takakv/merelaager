import { User } from "../db/models/User";
import { Staff } from "../db/models/Staff";
import { ShiftInfo } from "../db/models/ShiftInfo";
import { Request, Response } from "express";
import { userIsRoot } from "../routes/Support Files/shiftAuth";
import Entity = Express.Entity;
import { UserData, UserShift } from "../routes/Support Files/users";
import { StatusCodes } from "http-status-codes";

require("dotenv").config();
const bcrypt = require("bcrypt");

const getYear = () => {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() === 11) ++year;
  return year;
};

const userExists = async (username: string) => {
  const user = await User.findByPk(username);
  return !!user;
};

const createUser = async (data) => {
  const salt = bcrypt.genSaltSync(parseInt(process.env.SALTR));
  const hash = bcrypt.hashSync(data.password, salt);
  try {
    await User.create({
      username: data.username,
      email: data.email,
      name: data.name,
      password: hash,
    });
    return true;
  } catch {
    return false;
  }
};

// Fetches all users from the database.
// No filters.
exports.fetchAll = async () => {
  const response = { isOk: false, code: 200, users: null };
  let users;

  try {
    users = await User.findAll({
      attributes: ["username", "name", "nickname", "role", "email"],
    });
  } catch (e) {
    console.error(e);
    response.code = 500;
    return response;
  }

  if (!users) {
    response.code = 404;
    return response;
  }

  response.isOk = true;
  response.users = [];

  users.forEach((user) => {
    response.users.push({
      username: user.username,
      name: user.name,
      nickname: user.nickname,
      role: user.role,
      email: user.email,
    });
  });

  return response;
};

exports.swapShift = async (userId: number, shiftNr: number, isBoss = false) => {
  let role = "root";

  if (!isBoss) {
    const shiftInfo = await Staff.findOne({
      where: {
        userId,
        shiftNr,
        year: new Date().getFullYear(),
      },
    });
    if (!shiftInfo) return null;
    role = shiftInfo.role;
  }

  try {
    const user = await User.findByPk(userId);
    user.currentShift = shiftNr;
    await user.save();
    return role;
  } catch (e) {
    console.error(e);
    return null;
  }
};

exports.getInfo = async (userId: number) => {
  const user = await User.findByPk(userId);
  const shiftNr = user.currentShift;
  const name = user.nickname;

  let role;
  const shifts: number[] = [];

  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() === 11) ++year;

  if (user.role !== "root") {
    const shiftInfo = await Staff.findAll({
      where: { userId, year },
    });
    if (!shiftInfo) return null;
    shiftInfo.forEach((shift: Staff) => {
      shifts.push(shift.shiftNr);
      if (shift.shiftNr === shiftNr) role = shift.role;
    });
    if (!shifts.includes(shiftNr)) return null;
  } else {
    const allShifts = await ShiftInfo.findAll();
    allShifts.forEach((shift) => {
      shifts.push(shift.id);
    });
    role = "root";
  }

  return {
    name,
    shiftNr,
    role,
    shifts,
  };
};

exports.validateShift = async (
  userId: number,
  shiftNr: number,
  year = new Date().getFullYear()
) => {
  const entry = await Staff.findOne({
    where: { userId, shiftNr, year },
    attributes: ["role"],
  });

  if (entry) return { role: entry.role };
  else return null;
};

exports.create = async (req: Request, res: Response) => {
  const { username, password, email, name } = req.body;

  const isNew = !(await userExists(username));
  if (!isNew) {
    res.status(400).end();
    return;
  }

  const creationSuccessful = await createUser({
    username,
    password,
    email,
    name,
  });
  if (!creationSuccessful) res.status(400).end();
  else res.status(201).end();
};

exports.getShifts = async (userId: number) => {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() === 11) ++year;

  const shiftInfo = await Staff.findAll({ where: { userId, year } });
  console.log(shiftInfo);
};

const fetchShifts = async (userId: number, isRoot: boolean = false) => {
  const shifts: UserShift[] = [];

  const currentShifts = await Staff.findAll({
    where: { userId: userId, year: new Date().getUTCFullYear() },
    attributes: ["shiftNr", "role"],
  });

  currentShifts.forEach((shift) =>
    shifts.push({ id: shift.shiftNr, role: shift.role })
  );

  if (!isRoot) return shifts;

  const shiftCount = await ShiftInfo.count();
  if (shiftCount === shifts.length) return shifts;

  // Populate the shift switcher with least-access.
  for (let i = 1; i <= shiftCount; ++i) {
    if (!shifts.find((el) => el.id === i)) shifts.push({ id: i, role: "part" });
  }
  return shifts;
};

export const fetchUser = async (entity: Entity, userId: number) => {
  if (isNaN(userId)) return { statusCode: 400, data: {} };
  const isRoot = userIsRoot(entity);

  if (entity.id !== userId && !isRoot) return { statusCode: 403, data: {} };

  const user = await User.findByPk(userId);
  if (!user) return { statusCode: 404, data: {} };

  const shifts = await fetchShifts(userId, isRoot);

  const userData: UserData = {
    name: user.nickname,
    currentShift: user.currentShift,
    isRoot: user.role === "root",
    role: user.role,
    shifts,
  };

  return {
    statusCode: 200,
    data: userData,
  };
};

class UserController {
  public static updateSelectedShift = async (
    newShift: number,
    entity: Entity
  ) => {
    if (!userIsRoot(entity)) {
      const userInShift = await Staff.findOne({
        where: { shiftNr: newShift, userId: entity.id, year: getYear() },
      });
      if (!userInShift) return StatusCodes.FORBIDDEN;
    }

    const user = await User.findByPk(entity.id);
    user.currentShift = newShift;

    try {
      await user.save();
    } catch (e) {
      console.error();
      return StatusCodes.INTERNAL_SERVER_ERROR;
    }

    return StatusCodes.NO_CONTENT;
  };
}

export default UserController;
