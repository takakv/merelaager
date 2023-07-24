import { Request } from "express";
import { Registration } from "../db/models/Registration";
import { Child } from "../db/models/Child";
import { Team } from "../db/models/Team";
import { ShiftData } from "../db/models/ShiftData";
import { CamperEntry } from "../routes/Support Files/campers";
import { StatusCodes } from "http-status-codes";
import { UserLogEntry } from "../logging/UserLogEntry";
import { loggingActions, loggingModules } from "../logging/loggingModules";
import Entity = Express.Entity;
import {
  approveRole,
  requireShiftBoss,
} from "../routes/Support Files/shiftAuth";

export const populate = async () => {
  const dbShiftData = await ShiftData.findAll();
  for (const entry of dbShiftData) {
    const registration = await Registration.findOne({
      where: { childId: entry.childId },
    });
    if (!registration.isRegistered) {
      await entry.destroy();
    }
  }

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

    const shiftEntry = await ShiftData.findOne({
      where: { childId: child.id, shiftNr },
    });

    if (!shiftEntry && registration.isRegistered) {
      await ShiftData.create({
        childId: child.id,
        shiftNr,
        parentNotes: registration.addendum,
      });
    }
  }
};

export const getInfo = async (user: Entity, shiftNr: number) => {
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
    const entryObj: CamperEntry = {
      childId: entry.child.id, // Child data entry id
      entryRef: entry.id, // Shift data entry id
      name: entry.child.name,
      gender: entry.child.gender,
      tentNr: entry.tentNr,
      teamId: entry.teamId,
      isPresent: entry.isPresent,
    };

    if (approveRole(user, "boss")) {
      entryObj.notes = entry.child.notes;
      entryObj.parentNotes = entry.parentNotes;
    }

    // Don't expose sensitive data unnecessarily.
    if (entry.isActive) resObj.push(entryObj);
  });

  return resObj;
};

export const patchCamper = async (req: Request, childId: number) => {
  if (isNaN(childId)) return StatusCodes.BAD_REQUEST;

  const camper = await ShiftData.findOne({ where: { childId } });
  if (!camper) return StatusCodes.NOT_FOUND;

  const keys = Object.keys(req.body);
  const logObj = new UserLogEntry(
    req.user.id,
    loggingModules.campers,
    loggingActions.update
  );

  for (const key of keys) {
    switch (key) {
      case "tentNr":
        let tentNr = req.body.tentNr;
        if (tentNr !== null) {
          tentNr = parseInt(req.body.tentNr);
          if (isNaN(tentNr) || tentNr < 1 || tentNr > 10)
            return StatusCodes.BAD_REQUEST;
        }
        camper.tentNr = tentNr;
        break;
      case "isPresent":
        camper.isPresent = !!req.body.isPresent;
        break;
      case "teamId":
        let teamId = req.body.teamId;
        if (teamId !== null) {
          teamId = parseInt(teamId);
          if (Number.isNaN(teamId) || teamId < 1)
            return StatusCodes.BAD_REQUEST;

          const team = await Team.findByPk(teamId);
          if (!team) return StatusCodes.NOT_FOUND;
        }
        camper.teamId = teamId;
        break;
      default:
        return StatusCodes.UNPROCESSABLE_ENTITY;
    }
    logObj.setAndCommit({ camperId: camper.id, field: key });
  }

  try {
    await camper.save();
    logObj.log();
  } catch (e) {
    console.error(e);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }

  return StatusCodes.NO_CONTENT;
};
