const db = require("../models/database");

const Children = db.children;
const Registrations = db.registrations;
const newChildren = db.child;

exports.forceUpdate = async () => {
  // Fetch all registered campers.
  const regCampers = await Registrations.findAll({
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
  const regCampers = await Registrations.findAll({
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

const addChildEntry = async (data) => {
  await newChildren.create({
    name: data.name,
    gender: data.gender === "Poiss" ? "M" : "F",
  });
  return await newChildren.findOne({
    where: { name: data.name },
  });
};

exports.linkReg = async () => {
  // Fetch all registrations.
  const regs = await Registrations.findAll();

  const idless = [];

  for (const entry of regs) {
    const result = await newChildren.findAll({
      where: { name: entry.name },
    });

    if (result.length === 0) {
      idless.push(entry.name);
      const tmp = await addChildEntry(entry);
      entry.childId = tmp.id;
    } else if (result.length === 1) {
      entry.childId = result[0].id;
    } else {
      console.error(entry);
      console.error(result);
      continue;
    }
    await entry.save();
  }
  console.log(idless.sort());
};
