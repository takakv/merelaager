const db = require("../../models/database");

const ShiftStaff = db.staff;
const Users = db.users;

const requireShiftBoss = async (req, res, next) => {
  const { user } = req;

  if (user.role === "boss") return next();

  const now = new Date();
  let year = now.getUTCFullYear();
  if (now.getMonth() === 11) ++year;

  const result = await ShiftStaff.findOne({
    where: {
      userId: user.id,
      shiftNr: user.shift,
      year,
    },
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

const approveShift = async (user, shiftNr) => {
  if (user.role === "boss") return true;
  return user.shift === shiftNr;
};

const approveShiftFull = async (user, shiftNr) => {
  if (user.role === "boss") return true;

  const userId = (
    await Users.findOne({
      where: { username: user.username },
    })
  ).id;
  const accessEntry = await ShiftStaff.findOne({
    where: { userId, shiftNr, year: new Date().getUTCFullYear() },
  });
  return !!accessEntry;
};

module.exports = {
  requireShiftBoss,
  approveShift,
  approveShiftFull,
};
