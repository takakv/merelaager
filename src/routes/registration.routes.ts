import express from "express";
import {
  deleteShiftRegistration,
  fetchRegistrations,
  fetchShiftRegistrations,
} from "../controllers/registrations/registration.controller";
import { validateParams } from "../middleware/reqvalidate.middleware";
import {
  deleteRegistrationParamsSchema,
  shiftRegistrationParamsSchema,
} from "../controllers/registrations/registration.types";

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/", fetchRegistrations);

router.get(
  "/shifts/:shiftNr",
  validateParams(shiftRegistrationParamsSchema),
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fetchShiftRegistrations
);

router.delete(
  "/:regId",
  validateParams(deleteRegistrationParamsSchema),
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  deleteShiftRegistration
);

export default router;
