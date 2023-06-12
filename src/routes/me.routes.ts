/* eslint-disable @typescript-eslint/ban-ts-comment */
import express, { Router } from "express";

import { fetchUserFrontEndInfo, updateUserShift } from "../controllers/users/user.controller";
import { updateUserShiftSchema } from "../controllers/users/user.types";
import { validateParams } from "../middleware/reqvalidate.middleware";

const router: Router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/", fetchUserFrontEndInfo);

router.post(
  "/currentShift/:shiftNr",
  validateParams(updateUserShiftSchema),
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  updateUserShift
);

export default router;
