/* eslint-disable @typescript-eslint/ban-ts-comment */
import express from "express";

import { validateParams } from "../middleware/reqvalidate.middleware";

import { fetchTentParamsSchema } from "../controllers/tents/tents.types";

import { fetchTent } from "../controllers/tents/tents.controller";

const router = express.Router();

router.get(
  "/:tentId",
  validateParams(fetchTentParamsSchema),
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fetchTent
);

export default router;
