import express, { Request, Response } from "express";
import {
  createPermission,
  acRequest,
  createACGroup,
} from "../../controllers/permissionController";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

const newShiftData = require("../../controllers/newShiftController");
const records = require("../../controllers/recordController");

router.use((req, res, next) => {
  if (!("token" in req.body)) return res.sendStatus(401);
  if (req.body.token !== process.env.API_OVERRIDE) return res.sendStatus(403);
  next();
});

router.post("/register", async (req, res) => {
  try {
    await newShiftData.populate();
    res.sendStatus(201);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/records/", async (req, res) => {
  try {
    const tmp = await records.updateCurrentYear();
    if (tmp) res.sendStatus(201);
    else res.sendStatus(500);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

interface TypedRequestBody<T> extends Request {
  body: T;
}

router.post(
  "/permission",
  (req: TypedRequestBody<acRequest>, res: Response) => {
    createPermission(req.body)
      .then((code) => res.sendStatus(code))
      .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
  }
);

router.post(
  "/acgroup",
  (req: TypedRequestBody<acRequest>, res: Response) => {
    createACGroup(req.body)
      .then((code) => res.sendStatus(code))
      .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
  }
);

export default router;
