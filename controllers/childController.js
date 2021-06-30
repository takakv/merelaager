const db = require("../models/database");

const Children = db.children;
const Reglist = db.campers;
const newChildren = db.newChildren;

exports.forceUpdate = async () => {
  // Fetch all registered campers.
  const regCampers = await Reglist.findAll({
    where: { isRegistered: true },
  });

  // Add all missing campers.
  regCampers.forEach((camper) => {
    // Using a name stamp allows to match the camper even in case of capitalisation
    // differences without having to do ugly Sequelize hacks to match case independent strings.
    const nameStamp = camper.name.toLowerCase().replace(/\s/g, "");
    Children.findOrCreate({
      where: { id: nameStamp },
      defaults: {
        name: camper.name,
        gender: camper.gender === "Tüdruk" ? "F" : "M",
        id: nameStamp,
      },
    });
  });
};

exports.newChildren = async () => {
  // Fetch all registered campers.
  const regCampers = await Reglist.findAll({
    where: { isRegistered: true },
  });

  regCampers.forEach((camper) => {
    newChildren.findOrCreate({
      where: { name: camper.name },
      defaults: {
        name: camper.name,
        gender: camper.gender === "Tüdruk" ? "F" : "M",
      },
    });
  });
};
