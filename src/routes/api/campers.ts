import express, { Request, Response } from "express";

const router = express.Router();

import {getInfo, patchCamper} from "../../controllers/newShiftController";

const {
  approveShift,
  requireShiftBoss,
} = require("../Support Files/shiftAuth");

router.use(requireShiftBoss);

router.get("/:shiftNr?/", async (req: Request, res: Response) => {
  const shiftNr = parseInt(req.params.shiftNr);
  if (Number.isNaN(shiftNr)) return res.sendStatus(400);

  if (!(await approveShift(req.user, shiftNr))) {
    const message = "User not authorised for the shift";
    console.log(message);
    return res.sendStatus(403);
  }

  try {
    const data = await getInfo(shiftNr);
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
