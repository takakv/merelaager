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
        const shiftNr = parseInt(camper.shift[0]);
        ShiftData.findOrCreate({
          where: {
            childId: child.id,
            shiftNr,
          },
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
