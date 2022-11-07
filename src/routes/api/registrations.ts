import express, { Request, Response } from "express";
import RegistrationController, {
  deleteRegistration,
  patchRegistration,
} from "../../controllers/RegistrationController";
import { StatusCodes } from "http-status-codes";
import { createSession } from "better-sse";
import { registrationTracker } from "../../channels/registrationTracker";

const router = express.Router();

// Fetch the whole list of children and their registration status.
router.get("/", (req: Request, res: Response) => {
  RegistrationController.fetchRegistrations(req)
    .then((registrations) => res.json({ value: registrations }))
    .catch((e) => {
      console.error(e);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

router.get("/:regId", (req: Request, res: Response) => {
  const regId = parseInt(req.params.regId);
  RegistrationController.fetchRegistration(req, regId)
    .then((response) => {
      if (response.ok) return res.status(response.code).json(response.payload);
      else res.status(response.code).json(response);
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

router.post("/events", (req: Request, res: Response) => {
  createSession(req, res)
    .then((session) => {
      session.state.role = req.user.role;
      registrationTracker.register(session);
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

// TODO: Implement shift boss checking middleware, if convenient.
// All of the below require shift boss permissions.

// Fetch the PDF list of registrations for a single shift.
router.get("/pdf/:shiftNr", (req: Request, res: Response) => {
  const shiftNr = parseInt(req.params.shiftNr);
  RegistrationController.printShiftRegistrationsList(req.user, shiftNr)
    .then((response) => {
      if (response.ok)
        res.sendFile(response.filename, { root: "./data/files" });
      else {
        if (response.code === StatusCodes.NO_CONTENT)
          res.sendStatus(StatusCodes.NO_CONTENT);
        else res.status(response.code).json(response);
      }
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
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
