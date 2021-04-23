const db = require("../models/database");

const Children = db.children;
const Reglist = db.campers;
const ShiftData = db.shiftData;

exports.forceUpdate = async () => {
  // Fetch all registered campers.
  const regCampers = await Reglist.findAll({
    where: { isRegistered: true },
  });

  // Associate all registered campers with shifts.
  await regCampers.forEach((camper) => {
    const nameStamp = camper.name.toLowerCase().replace(/\s/g, "");
    Children.findByPk(nameStamp)
      .then((child) => {
        ShiftData.create({
          childId: child.id,
          shiftNr: parseInt(camper.shift[0]),
          parentNotes: camper.addendum,
        });
      })
      .catch(console.error);
  });
};
