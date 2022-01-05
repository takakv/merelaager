import {Registration} from "../db/models/Registration";
import {Child} from "../db/models/Child";
import {ShiftData} from "../db/models/ShiftData";

exports.forceUpdate = async () => {
  // Fetch all registered campers.
  const registrations = await Registration.findAll({
    where: { isRegistered: true },
  });

  // Associate all registered campers with shifts.
  for (const registration of registrations) {
    const { shiftNr } = registration;

    const child: Child = await Child.findOne({
      where: { id: registration.childId },
    });

    await ShiftData.findOrCreate({
      where: { childId: child.id, shiftNr },
      defaults: {
        childId: child.id,
        shiftNr,
        parentNotes: registration.addendum,
      },
    });
  }
};

export const getInfo = async (shiftNr: number) => {
  let entries: ShiftData[];
  try {
    if (shiftNr === 2) {
      entries = await ShiftData.findAll({
        order: [["childId", "ASC"]],
        include: Child,
      });
    } else {
      entries = await ShiftData.findAll({
        where: { shiftNr },
        order: [["childId", "ASC"]],
        include: Child,
      });
    }
    if (!entries) return null;
  } catch (e) {
    console.error(e);
    return null;
  }

  const resObj = {};

  entries.forEach((entry: ShiftData) => {
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
