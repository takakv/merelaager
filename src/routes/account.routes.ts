import express from "express";
import { validateBody } from "../middleware/reqvalidate.middleware";
import { accountCreationRequestSchema } from "../controllers/account/account.types";
import { createAccount } from "../controllers/account/account.controller";

const router = express.Router();

router.post(
  "/create",
  validateBody(accountCreationRequestSchema),
  // @ts-ignore
  createAccount,
);
