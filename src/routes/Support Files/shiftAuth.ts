import {Staff} from "../../db/models/Staff";
import {User} from "../../db/models/User";

const requireShiftBoss = async (req, res, next) => {
  const { user } = req;

  if (user.isRoot) return next();

  const now = new Date();
  let year = now.getUTCFullYear();
  if (now.getMonth() === 11) ++year;

  const result = await Staff.findOne({
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
  if (user.isRoot) return true;
  return user.shift === shiftNr;
};

const approveShiftFull = async (user, shiftNr) => {
  if (user.isRoot) return true;

  const userId = (
    await User.findOne({
      where: { username: user.username },
    })
  ).id;
  const accessEntry = await Staff.findOne({
    where: { userId, shiftNr, year: new Date().getUTCFullYear() },
  });
  return !!accessEntry;
};

module.exports = {
  requireShiftBoss,
  approveShift,
  approveShiftFull,
};