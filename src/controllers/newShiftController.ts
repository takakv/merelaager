import { Request } from "express";
import { Registration } from "../db/models/Registration";
import { Child } from "../db/models/Child";
import { ShiftData } from "../db/models/ShiftData";
import { CamperEntry } from "../routes/Support Files/campers";

exports.populate = async () => {
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
    entries = await ShiftData.findAll({
      where: { shiftNr },
      order: [["childId", "ASC"]],
      include: Child,
    });
    if (!entries) return null;
  } catch (e) {
    console.error(e);
    return null;
  }

  const resObj: CamperEntry[] = [];

  entries.forEach((entry: ShiftData) => {
    // Don't expose sensitive data unnecessarily.
    if (entry.isActive)
      resObj.push({
        childId: entry.child.id, // Child data entry id
        entryRef: entry.id, // Shift data entry id
        name: entry.child.name,
        gender: entry.child.gender,
        notes: entry.child.notes,
        parentNotes: entry.parentNotes,
        tentNr: entry.tentNr,
        teamId: entry.teamId,
        isPresent: entry.isPresent,
      });
  });

  return resObj;
};

export const patchCamper = async (req: Request, childId: number) => {
  if (isNaN(childId)) return 404;

  const camper = await ShiftData.findOne({ where: { childId } });
  if (!camper) return 404;

  const keys = Object.keys(req.body);

  let patchError = 0;
  keys.forEach((key) => {
    switch (key) {
      case "tentNr":
        let tentNr = req.body.tentNr;
        if (tentNr !== null) {
          tentNr = parseInt(req.body.tentNr);
          if (isNaN(tentNr) || tentNr < 1 || tentNr > 10) {
            patchError = 400;
            break;
          }
        }
        camper.tentNr = tentNr;
        break;
      case "isPresent":
        camper.isPresent = !!req.body.isPresent;
        break;
      default:
        patchError = 422;
    }
  });

  if (patchError !== 0) return patchError;

  try {
    await camper.save();
  } catch (e) {
    console.error(e);
    return 500;
  }

  return 204;
};
