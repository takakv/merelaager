/* eslint-disable @typescript-eslint/ban-ts-comment */
import express from "express";

import {validateBody, validateParams} from "../middleware/reqvalidate.middleware";

import {
  fetchTentParamsSchema, tentScoreBodySchema,
  tentScoreParamsSchema,
} from "../controllers/tents/tents.types";

import { fetchTent, gradeTent } from "../controllers/tents/tents.controller";

const router = express.Router();

router.get(
  "/:tentId",
  validateParams(fetchTentParamsSchema),
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fetchTent
);

router.post(
  "/:tentId",
  validateParams(tentScoreParamsSchema),
  validateBody(tentScoreBodySchema),
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  gradeTent
);

export default router;
