import express, { Request, Response } from "express";
import RegistrationController, {
  patchRegistration,
} from "../../controllers/RegistrationController";
import { StatusCodes } from "http-status-codes";
import { createSession } from "better-sse";
import { registrationTracker } from "../../channels/registrationTracker";
import HttpError from "../Support Files/Errors/HttpError";

const router = express.Router();

// Fetch the whole list of children and their registration status.
router.get("/", (req: Request, res: Response) => {
  RegistrationController.fetchRegistrations(req.user)
    .then((registrations) => res.json({ value: registrations }))
    .catch((e) => {
      console.error(e);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

router.get("/:regId", (req: Request, res: Response) => {
  const regId = parseInt(req.params.regId);
  RegistrationController.fetchRegistration(req.user, regId)
    .then((response) => {
      if (response instanceof HttpError)
        res.status(response.httpCode).json(response.json());
      else res.json(response);
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

// Send registration confirmation to parents.
router.post("/notify", (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let { shiftNr } = req.body;
  if (!shiftNr) return res.sendStatus(StatusCodes.BAD_REQUEST);
  shiftNr = parseInt(shiftNr as string);
  RegistrationController.sendConfirmationEmail(req.user, shiftNr as number)
    .then(() => {
      res.sendStatus(StatusCodes.OK);
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

// Fetch the PDF list of registrations for a single shift.
router.get("/pdf/:shiftNr", (req: Request, res: Response) => {
  const shiftNr = parseInt(req.params.shiftNr);
  RegistrationController.printShiftRegistrationsList(req.user, shiftNr)
    .then((response) => {
      if (response instanceof HttpError)
        res.status(response.httpCode).json(response.json());
      else res.sendFile(response, { root: "./data/files" });
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
router.delete("/:regId", (req: Request, res: Response) => {
  const regId = parseInt(req.params.regId);
  RegistrationController.deleteRegistration(req.user, regId)
    .then((response) => {
      if (response === null) res.sendStatus(StatusCodes.NO_CONTENT);
      else res.status(response.httpCode).json(response.json());
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

export default router;
