import express from "express";
import {
  deleteShiftRegistration,
  fetchRegistration,
  fetchRegistrations,
  fetchShiftRegistrationPdf,
  fetchShiftRegistrations,
} from "../controllers/registrations/registration.controller";
import { validateParams } from "../middleware/reqvalidate.middleware";
import {
  deleteRegistrationParamsSchema,
  fetchRegistrationParamsSchema,
  shiftRegistrationParamsSchema,
} from "../controllers/registrations/registration.types";

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/", fetchRegistrations);

router.get(
  "/:regId",
  validateParams(fetchRegistrationParamsSchema),
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fetchRegistration
);

router.get(
  "/shifts/:shiftNr",
  validateParams(shiftRegistrationParamsSchema),
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fetchShiftRegistrations
);

router.get(
  "/pdf/:shiftNr",
  validateParams(shiftRegistrationParamsSchema),
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fetchShiftRegistrationPdf
);

router.delete(
  "/:regId",
  validateParams(deleteRegistrationParamsSchema),
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  deleteShiftRegistration
);

export default router;
