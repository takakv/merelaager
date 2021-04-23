const db = require("../models/database");

const Children = db.children;
const Reglist = db.campers;
const ShiftData = db.shiftData;

exports.forceUpdate = async () => {
  const campers = [];

  // Fetch all registered campers.
  const regCampers = await Reglist.findAll({
    where: { isRegistered: true },
  });

  // Associate all registered campers with shifts.
  regCampers.forEach(async (camper) => {
    const nameStamp = camper.name.toLowerCase().replace(/\s/g, "");
    const child = await Children.findOne({ where: { nameStamp: nameStamp } });
    campers.push({
      childId: child.id,
      shiftNr: parseInt(camper.shift[0]),
    });
  });

  // Update the shifts list.
  campers.forEach((camper) => {
    ShiftData.create({
      childId: camper.childId,
      shiftNr: camper.shiftNr,
    });
  });
};
