/* eslint-disable @typescript-eslint/ban-ts-comment */
import express, { type Request, type Response } from "express";

import authMiddleware from "../middleware/auth.middleware";
import {
  validateBody,
  validateParams,
} from "../middleware/reqvalidate.middleware";

import {
  deleteRegistrationParamsSchema,
  fetchRegistrationParamsSchema,
  patchRegistrationBodySchema,
  patchRegistrationParamsSchema,
  registerBodySchema,
  shiftRegistrationParamsSchema,
} from "../controllers/registrations/registration.types";

import {
  deleteShiftRegistration,
  fetchRegistration,
  fetchRegistrations,
  fetchShiftRegistrationPdf,
  fetchShiftRegistrations,
  patchRegistration,
} from "../controllers/registrations/registration.controller";
import { StatusCodes } from "http-status-codes";
import RegistrationController from "../controllers/RegistrationController";
import { create } from "../controllers/registration/registrationController";

const router = express.Router();

router.post("/register", validateBody(registerBodySchema), create);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.use(authMiddleware);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/", fetchRegistrations);

router.get(
  "/:regId",
  validateParams(fetchRegistrationParamsSchema),
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fetchRegistration,
);

router.get(
  "/shifts/:shiftNr",
  validateParams(shiftRegistrationParamsSchema),
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fetchShiftRegistrations,
);

router.get(
  "/pdf/:shiftNr",
  validateParams(shiftRegistrationParamsSchema),
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fetchShiftRegistrationPdf,
);

router.delete(
  "/:regId",
  validateParams(deleteRegistrationParamsSchema),
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  deleteShiftRegistration,
);

router.patch(
  "/:regId",
  validateParams(patchRegistrationParamsSchema),
  validateBody(patchRegistrationBodySchema),
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  patchRegistration,
);

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

router.post("/relink", (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  RegistrationController.linkBillsAndReg()
    .then(() => {
      res.sendStatus(StatusCodes.OK);
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

export default router;
