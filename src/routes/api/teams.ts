import express, { Request, Response } from "express";
import { createTeam, fetchForYear } from "../../controllers/teamController";

const router = express.Router();

// Fetch the team names and IDs for a given year and optionally shift.
router.get("/bulk/:year/:shiftNr?", async (req: Request, res: Response) => {
  const year = parseInt(req.params.year);
  const shiftNr = parseInt(req.params.shiftNr);
  const data = await fetchForYear(year, shiftNr);
  return res.status(data.statusCode).json(data.data);
});

// Create a new team.
router.post("/", async (req: Request, res: Response) => {
  const { year, shiftNr, name } = req.body;
  const code = await createTeam(year, shiftNr, name);
  return res.sendStatus(code);
});

export default router;
