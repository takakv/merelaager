import db from "../models/database";

const Registrations = db.registrations;
const newChildren = db.child;

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
