import {ShiftStaff} from "../db/models/ShiftStaff";

const roles = {
  boss: "boss",
  full: "full",
  part: "part",
};

exports.fetch = async (shiftNr) => {
  const currentDate = new Date();
  let year = currentDate.getUTCFullYear();
  if (currentDate.getMonth() === 11) ++year;
  const staff = await ShiftStaff.findAll({ where: { shiftNr, year } });

  if (!staff) return false;
  const resObj = {};

  staff.forEach((member) => {
    resObj[member.id] = {
      id: member.id,
      name: member.name,
      role: member.role,
      linked: !!member.userId,
    };
  });
  return resObj;
};

exports.create = async (shiftNr, name, role) => {
  if (!roles[role]) return false;
  try {
    await ShiftStaff.create({
      shiftNr,
      name,
      role,
    });
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};
