const router = require("express").Router();

import { getInfo } from "../../controllers/newShiftController";

const {
  approveShift,
  requireShiftBoss,
} = require("../Support Files/shiftAuth");

router.use(requireShiftBoss);

router.get("/info/fetch/:shiftNr?/", async (req, res) => {
  const shiftNr = parseInt(req.params.shiftNr);
  if (Number.isNaN(shiftNr)) return res.sendStatus(400);

  if (!(await approveShift(req.user, shiftNr))) {
    const message = "User not authorised for the shift";
    console.log(message);
    return res.sendStatus(403);
  }

  const data = await getInfo(shiftNr);
  if (data) res.json(data);
  else res.sendStatus(500);
});

export default router;