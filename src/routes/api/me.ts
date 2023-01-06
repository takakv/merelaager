/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import UserController from "../../controllers/userController";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const registrations = await UserController.fetchUser(req.user, req.user.id);
  res.status(registrations.statusCode).json(registrations.data);
});

router.post(
  "/currentShift",
  async (req: Request<never, never, { newShift: number }>, res: Response) => {
    const { newShift } = req.body;
    if (isNaN(newShift)) return StatusCodes.BAD_REQUEST;

    const statusCode = await UserController.updateSelectedShift(
      newShift,
      req.user
    );
    res.sendStatus(statusCode);
  }
);

export default router;
