import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  create as createBill,
  fetch as fetchBill,
} from "../../controllers/billController";

const router = express.Router();

router.get("/:action/:email", async (req: Request, res: Response) => {
  if (!req.params.action || !req.params.email) {
    return res.sendStatus(StatusCodes.BAD_REQUEST);
  }

  switch (req.params.action) {
    case "fetch":
      await fetchBill(req, res);
      break;
    case "create":
      await createBill(req, res);
      break;
    default:
      return res.sendStatus(StatusCodes.UNPROCESSABLE_ENTITY);
  }
});

export default router;
