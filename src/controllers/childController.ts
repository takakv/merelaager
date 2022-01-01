import Registration from "../db/models/Registration";
import Child from "../db/models/Child";

exports.newChildren = async () => {
  // Fetch all registered campers.
  const regCampers = await Registration.findAll({
    where: { isRegistered: true },
  });

  regCampers.forEach((camper) => {
    Child.findOrCreate({
      where: { name: camper.name },
      defaults: {
        name: camper.name,
        gender: camper.gender === "Tüdruk" ? "F" : "M",
      },
    });
  });
};

const addChildEntry = async (data) => {
  await Child.create({
    name: data.name,
    gender: data.gender === "Poiss" ? "M" : "F",
  });
  return await Child.findOne({
    where: { name: data.name },
  });
};

exports.linkReg = async () => {
  // Fetch all registrations.
  const regs = await Registration.findAll();

  const idless = [];

  for (const entry of regs) {
    const result = await Child.findAll({
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
