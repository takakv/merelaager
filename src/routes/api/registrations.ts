import express, { Request, Response } from "express";

const router = express.Router();

const registrationList = require("../../controllers/listController");
const { requireShiftBoss } = require("../Support Files/shiftAuth");
import {
  fetchRegistrations,
  patchRegistration,
  print,
} from "../../controllers/listController";

// Fetch the whole list of children and their registration status.
router.get("/", async (req: Request, res: Response) => {
  try {
    const registrations = await fetchRegistrations(req);
    res.json({ value: registrations });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// Fetch the PDF list of registrations for a single shift.
router.get("/pdf/:shiftNr", async (req: Request, res: Response) => {
  const shiftNr = parseInt(req.params.shiftNr);
  const fileName = await print(req.body.user, shiftNr);
  if (!fileName) return res.sendStatus(500);
  return res.sendFile(fileName, { root: "./data/files" });
});

// Update values for a specific registration.
router.patch("/:regId", async (req: Request, res: Response) => {
  const regId = parseInt(req.params.regId);
  const statusCode = await patchRegistration(req, regId);
  res.sendStatus(statusCode);
});

router.use(requireShiftBoss);

router.post("/remove/:userId/", async (req, res) => {
  try {
    const status = await registrationList.remove(req, res);
    if (status) res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

export default router;
