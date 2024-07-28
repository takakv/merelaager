import express, { Request, Response } from "express";

const router = express.Router();

import { getInfo, patchCamper } from "../../controllers/newShiftController";
import Entity = Express.Entity;
import { CamperEntry } from "../Support Files/campers";
import { StatusCodes } from "http-status-codes";
import { Permission } from "../../db/models/Permission";
import { Role } from "../../db/models/Role";
import { approvePm } from "../../utils/permissionValidator";
import Constants from "../../utils/constants";

const { approveShift } = require("../Support Files/shiftAuth");

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/:shiftNr?/", async (req: Request, res: Response) => {
  const shiftNr = parseInt(req.params.shiftNr);
  if (Number.isNaN(shiftNr)) return res.sendStatus(400);

  const user: Entity = req.user;

  // User has no role for this shift.
  if (!user.shiftRoles.hasOwnProperty(shiftNr)) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  /*
  if (!(await approveShift(req.user, shiftNr))) {
    const message = "User not authorised for the shift";
    console.log(message);
    return res.sendStatus(403);
  }
  */

  try {
    const data = await getInfo(req.user, shiftNr);
    res.json({ value: data });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// Update values for a specific camper.
router.patch("/camper/:childId", async (req: Request, res: Response) => {
  const childId = parseInt(req.params.childId);
  const statusCode = await patchCamper(req, childId);
  res.sendStatus(statusCode);
});

export default router;
