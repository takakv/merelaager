const db = require("../models/database");

const Children = db.child;
const Registrations = db.registrations;
const ShiftData = db.shiftData;

exports.forceUpdate = async () => {
  // Fetch all registered campers.
  const registered = await Registrations.findAll({
    where: { isRegistered: true },
  });

  // Associate all registered campers with shifts.
  await registered.forEach((camper) => {
    const shiftNr = parseInt(camper.shift[0]);

    Children.findOne({
      where: { name: camper.name },
    })
      .then((child) => {
        ShiftData.findOrCreate({
          where: { childId: child.id, shiftNr },
          defaults: {
            childId: child.id,
            shiftNr,
            parentNotes: camper.addendum,
          },
        });
      })
      .catch(console.error);
  });
};

exports.getInfo = async (shiftNr) => {
  let entries;
  try {
    if (shiftNr === 2) {
      entries = await ShiftData.findAll({
        order: [["childId", "ASC"]],
        include: Children,
      });
    } else {
      entries = await ShiftData.findAll({
        where: { shiftNr },
        order: [["childId", "ASC"]],
        include: Children,
      });
    }
    if (!entries) return null;
  } catch (e) {
    console.error(e);
    return null;
  }

  const resObj = {};

  entries.forEach((entry) => {
    resObj[entry.child.id] = {
      id: entry.child.id, // Child data entry id
      shiftId: entry.id, // Shift data entry id
      name: entry.child.name,
      gender: entry.child.gender,
      notes: entry.child.notes,
      parentNotes: entry.parentNotes,
      tentNr: entry.tentNr,
      teamId: entry.teamId,
    };
  });

  return resObj;
};
