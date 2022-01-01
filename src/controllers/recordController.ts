import Registration from "../db/models/Registration";
import Record from "../db/models/Record";

exports.updateCurrentYear = async () => {
  const registered = await Registration.findAll({
    where: { isRegistered: true },
  });

  if (!registered || registered.length === 0) return false;

  const year = new Date().getFullYear();

  for (const entry of registered) {
    await Record.findOrCreate({
      where: {
        year,
        shiftNr: entry.shiftNr,
        childId: entry.childId,
      },
    });
  }

  return true;
};
