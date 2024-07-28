/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Request, Response } from "express";
import {StatusCodes} from "http-status-codes";

import UserController from "../../controllers/userController";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  if (!req.user.isRoot) return res.sendStatus(StatusCodes.FORBIDDEN);

  const data = await UserController.fetchAll();
  if (!data.isOk) return res.sendStatus(data.code);
  return res.json(data.users);
});

router.get("/:userId", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const registrations = await UserController.fetchUser(req.user, userId);
  res.status(registrations.statusCode).json(registrations.data);
});

export default router;
