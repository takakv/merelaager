import express from "express";

import {
  validateBody,
  validateParams,
} from "../middleware/reqvalidate.middleware";

import {
  deleteRegistrationParamsSchema,
  fetchRegistrationParamsSchema,
  patchRegistrationBodySchema,
  patchRegistrationParamsSchema,
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

router.patch(
  "/:regId",
  validateParams(patchRegistrationParamsSchema),
  validateBody(patchRegistrationBodySchema),
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  patchRegistration
);

export default router;
