import express, { Request, Response } from "express";
import UserController, {
  fetchUser,
} from "../../controllers/userController";
import {StatusCodes} from "http-status-codes";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const registrations = await fetchUser(req.user, req.user.id);
  res.status(registrations.statusCode).json(registrations.data);
});

router.post("/currentShift", async (req: Request<never, never, { newShift: number }>, res: Response) => {
  const { newShift } = req.body;
  if (isNaN(newShift)) return StatusCodes.BAD_REQUEST;

  const statusCode = await UserController.updateSelectedShift(newShift, req.user);
  res.sendStatus(statusCode);
});

export default router;
