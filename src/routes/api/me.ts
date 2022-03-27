import express, { Request, Response } from "express";
import {
  fetchUser,
  updateCurrentShift,
} from "../../controllers/userController";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const registrations = await fetchUser(req.user, req.user.id);
  res.status(registrations.statusCode).json(registrations.data);
});

router.post("/currentShift", async (req: Request, res: Response) => {
  const statusCode = await updateCurrentShift(req);
  res.sendStatus(statusCode);
});

export default router;
