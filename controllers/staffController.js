const db = require("../models/database");

const Staff = db.staff;

exports.fetch = async (shiftNr) => {
  const year = new Date().getUTCFullYear();
  const staff = await Staff.findAll({where: {shiftNr, year}});
  console.log(staff);
}