import { Request, Response } from "express";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";

const router = Router();

const staff = require("../../controllers/staffController");

router.post("/create/", async (req: Request, res: Response) => {
  const shiftNr = parseInt(req.body.shiftNr);
  const { name, role } = req.body;
  if (!shiftNr || !name || !role)
    return res.sendStatus(StatusCodes.BAD_REQUEST);

  const result = await staff.create(shiftNr, name, role);
  if (result) res.sendStatus(StatusCodes.CREATED);
  else res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
});

router.get("/:shiftNr/", async (req: Request, res: Response) => {
  const shiftNr = parseInt(req.params.shiftNr);
  if (!shiftNr) return res.sendStatus(StatusCodes.BAD_REQUEST);

  const result = await staff.fetch(shiftNr);
  if (!result) return res.sendStatus(StatusCodes.NOT_FOUND);
  res.json(result);
});

export default router;
