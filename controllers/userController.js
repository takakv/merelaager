require("dotenv").config();
const db = require("../models/database");
const bcrypt = require("bcrypt");

const Users = db.users;
const Staff = db.staff;
const ShiftInfo = db.shiftInfo;

const userExists = async (username) => {
  const user = await Users.findByPk(username);
  return !!user;
};

const createUser = async (username, password) => {
  const salt = bcrypt.genSaltSync(parseInt(process.env.SALTR));
  const hash = bcrypt.hashSync(password, salt);
  try {
    await Users.create({
      username: username,
      password: hash,
    });
    return true;
  } catch {
    return false;
  }
};

exports.swapShift = async (userId, shiftNr, isBoss = false) => {
  let role = "boss";

  if (isBoss) {
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
    const res = await Users.findByPk(userId);
    res.shifts = shiftNr;
    await res.save();
    return role;
  } catch (e) {
    console.error(e);
    return null;
  }
};

exports.getInfo = async (userId) => {
  const user = await Users.findByPk(userId);
  const shiftNr = user.shifts;
  const name = user.nickname;

  let role;
  const shifts = [];

  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() === 11) ++year;

  if (user.role !== "boss") {
    const shiftInfo = await Staff.findAll({
      where: { userId, year },
    });
    if (!shiftInfo) return null;
    shiftInfo.forEach((shift) => {
      shifts.push(shift.shiftNr);
      if (shift.shiftNr === shiftNr) role = shift.role;
    });
    if (!shifts.includes(shiftNr)) return null;
  } else {
    const allShifts = await ShiftInfo.findAll();
    allShifts.forEach((shift) => {
      shifts.push(shift.id);
    });
    role = "boss";
  }

  return {
    name,
    shiftNr,
    role,
    shifts,
  };
};

exports.validateShift = async (
  userId,
  shiftNr,
  year = new Date().getFullYear()
) => {
  const entry = await Staff.findOne({
    where: { userId, shiftNr, year },
    attributes: ["role"],
  });

  if (entry) return { role: entry.role };
  else return null;
};

exports.create = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const isNew = !(await userExists(username));
  if (!isNew) {
    res.status(400).end();
    return;
  }

  const creationSuccessful = await createUser(username, password);
  if (!creationSuccessful) res.status(400).end();
  else res.status(201).end();
};

exports.getShifts = async (userId) => {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() === 11) ++year;

  const shiftInfo = await Staff.findAll({ where: { userId, year } });
  console.log(shiftInfo);
};
