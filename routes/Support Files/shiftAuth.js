const db = require("../../models/database");

const ShiftStaff = db.staff;
const Users = db.users;

const approveShift = async (user, shiftNr) => {
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
  approveShift,
};
