const db = require("../models/database");

const Registrations = db.registrations;
const Records = db.records;

exports.updateCurrentYear = async () => {
  const registered = await Registrations.findAll({
    where: { isRegistered: true },
  });

  if (!registered || registered.length === 0) return false;

  const year = new Date().getFullYear();

  for (const entry of registered) {
    await Records.findOrCreate({
      where: {
        year,
        shiftNr: entry.shiftNr,
        childId: entry.childId,
      },
    });
  }

  return true;
};
