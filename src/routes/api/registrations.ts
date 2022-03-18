import express, { Request, Response } from "express";

const router = express.Router();

const registrationList = require("../../controllers/listController");
const { requireShiftBoss } = require("../Support Files/shiftAuth");
import {
  fetchRegistrations,
  patchRegistration,
  update,
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

// Update values for a specific registration.
router.patch("/:regId", async (req: Request, res: Response) => {
  const regId = parseInt(req.params.regId);
  const statusCode = await patchRegistration(req, regId);
  res.sendStatus(statusCode);
});

router.use(requireShiftBoss);

router.get("/print/:shiftNr/", async (req, res) => {
  if (!req.params["shiftNr"]) return res.sendStatus(400);
  const shiftNr = parseInt(req.params["shiftNr"]);
  const filename = await registrationList.print(shiftNr);
  if (filename) return res.sendFile(filename, { root: "./data/files" });
  res.sendStatus(404);
});

router.post(
  "/update/:userId/:field/:value?/",
  async (req: Request, res: Response) => {
    try {
      const status = await update(req, res);
      if (status) res.sendStatus(200);
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  }
);

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
