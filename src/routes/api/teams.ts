import express, { Request, Response } from "express";
import {
  createTeam,
  deleteTeam,
  fetchForYear,
} from "../../controllers/teamController";

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
  const data = await createTeam(year, shiftNr, name);
  return res.status(data.statusCode).json(data.data);
});

// Delete a team.
router.delete("/:teamId", async (req: Request, res: Response) => {
  const teamId = parseInt(req.params.teamdId);
  const code = await deleteTeam(teamId, req.user);
  return res.sendStatus(code);
});

export default router;
