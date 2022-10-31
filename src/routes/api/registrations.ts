/* eslint-disable @typescript-eslint/no-misused-promises */
import express, {Request, Response} from "express";
import {
  deleteRegistration,
  fetchRegistrations,
  patchRegistration,
  print,
} from "../../controllers/listController";
import {StatusCodes} from "http-status-codes";
import {createSession} from "better-sse";
import {registrationTracker} from "../../channels/registrationTracker";

const router = express.Router();

// Fetch the whole list of children and their registration status.
router.get("/", async (req: Request, res: Response) => {
  try {
    const registrations = await fetchRegistrations(req);
    res.json({value: registrations});
  } catch (e) {
    console.error(e);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

router.post("/events", async (req: Request, res: Response) => {
  const session = await createSession(req, res);
  session.state.role = req.user.role;
  registrationTracker.register(session);
});

// TODO: Implement shift boss checking middleware, if convenient.
// All of the below require shift boss permissions.

// Fetch the PDF list of registrations for a single shift.
router.get("/pdf/:shiftNr", async (req: Request, res: Response) => {
  const shiftNr = parseInt(req.params.shiftNr);
  const fileName = await print(req.user, shiftNr);
  if (!fileName) return res.sendStatus(500);
  return res.sendFile(fileName, {root: "./data/files"});
});

// Update values for a specific registration.
router.patch("/:regId", async (req: Request, res: Response) => {
  const regId = parseInt(req.params.regId);
  const statusCode = await patchRegistration(req, regId);
  res.sendStatus(statusCode);
});

// Delete a registration permanently.
router.delete("/:regId", async (req: Request, res: Response) => {
  const regId = parseInt(req.params.regId);
  const statusCode = await deleteRegistration(req.user, regId);
  res.sendStatus(statusCode);
});

export default router;
