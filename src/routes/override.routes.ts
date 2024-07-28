import express, { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { matchPermissionsToRoles } from "../db/db.seeder";

import { populate } from "../controllers/newShiftController";
import { updateCurrentYear } from "../controllers/recordController";
import PermissionController, {
  createPermission,
  ACRequest,
  createACGroup,
} from "../controllers/permissionController";
import { validateBody } from "../middleware/reqvalidate.middleware";
import {
  overrideBodySchema,
  OverrideRequestSchema,
} from "../controllers/overrides/override.types";
import { ValidatedRequest } from "express-joi-validation";
import bcrypt from "bcrypt";

const router = express.Router();

// Ensure that the override is authorised.
router.use(
  validateBody(overrideBodySchema),
  (
    req: ValidatedRequest<OverrideRequestSchema>,
    res: Response,
    next: NextFunction,
  ) => {
    const { token } = req.body;

    if (bcrypt.compareSync(token, process.env.API_OVERRIDE))
      return res.sendStatus(StatusCodes.FORBIDDEN);

    next();
  },
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/register", async (req, res) => {
  try {
    await populate();
    res.sendStatus(StatusCodes.CREATED);
  } catch (e) {
    console.error(e);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/records/", async (req, res) => {
  try {
    const tmp = await updateCurrentYear();
    if (tmp) res.sendStatus(StatusCodes.CREATED);
    else res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  } catch (e) {
    console.error(e);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
});

interface TypedRequestBody<T> extends Request {
  body: T;
}

router.post("/seed-permissions", (req: Request, res: Response) => {
  matchPermissionsToRoles()
    .then(() => res.sendStatus(StatusCodes.OK))
    .catch((e) => {
      console.log(e);
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });
});

router.post(
  "/permission",
  (req: TypedRequestBody<ACRequest>, res: Response) => {
    createPermission(req.body)
      .then((code) => res.sendStatus(code))
      .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
  },
);

router.post("/acgroup", (req: TypedRequestBody<ACRequest>, res: Response) => {
  createACGroup(req.body)
    .then((code) => res.sendStatus(code))
    .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
});

router.post("/permissions/init", (req: Request, res: Response) => {
  PermissionController.initDB()
    .then((code) => res.sendStatus(code))
    .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
});

export default router;
