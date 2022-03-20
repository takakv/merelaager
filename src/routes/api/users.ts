import express, { Request, Response } from "express";
import {fetchUser} from "../../controllers/userController";

const user = require("../../controllers/userController");

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  if (!req.user.isRoot) return res.sendStatus(403);

  const data = await user.fetchAll();
  if (!data.isOk) return res.sendStatus(data.code);
  return res.json(data.users);
});

router.get("/:userId", async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const registrations = await fetchUser(req.user, userId);
  res.status(registrations.statusCode).json(registrations.data);
});

export default router;
