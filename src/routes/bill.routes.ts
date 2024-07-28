import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import BillController from "../controllers/BillController";

const router = express.Router();

router.get("/:action/:email", async (req: Request, res: Response) => {
  if (!req.params.action || !req.params.email) {
    return res.sendStatus(StatusCodes.BAD_REQUEST);
  }

  switch (req.params.action) {
    case "fetch":
      await BillController.fetchBill(req, res);
      break;
    case "create":
      await BillController.createBill(req, res);
      break;
    default:
      return res.sendStatus(StatusCodes.UNPROCESSABLE_ENTITY);
  }
});

export default router;
