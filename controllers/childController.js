const db = require("../models/database");

const Children = db.children;
const Reglist = db.campers;

exports.forceUpdate = async () => {
  // Fetch all registered campers.
  const regCampers = await Reglist.findAll({
    where: { isRegistered: true },
  });

  // Add all missing campers.
  regCampers.forEach((camper) => {
    Children.findOrCreate({
      where: { name: camper.name },
      defaults: {
        name: camper.name,
        gender: camper.gender === "Tüdruk" ? "F" : "M",
      },
    });
  });
};
