import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

import auth from "./auth.routes";

router.use("/auth", auth);

import account from "./api/account";

router.use("/su", account);
router.use("/account", account);

import override from "./override.routes";

router.use("/override", override);

import pub from "./api/public";

router.use("/pb", pub);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/registrations", async (req: Request, res: Response) => {
  if (!req.body) return res.sendStatus(StatusCodes.BAD_REQUEST);
  await create(req, res);
});

// ---------- AUTH ZONE ------------------------------
import authMiddleware from "../middleware/auth.middleware";

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.use(authMiddleware);

import me from "./me.routes";

router.use("/me", me);

import users from "./api/users";

router.use("/users", users);

import registrationRoutes from "./registration.routes";

router.use("/registrations", registrationRoutes);

import tentRoutes from "./tents.routes";

router.use("/tents", tentRoutes);

import campers from "./api/campers";

router.use("/campers", campers);

import notes from "./api/notes";

router.use("/notes", notes);

import teams from "./api/teams";

router.use("/teams", teams);

import staff from "./api/staff";

router.use("/staff", staff);

// Disable since unneeded
// const users = require("./api/users");
// router.use("/users", users);

import bills from "./api/bills";

router.use("/bills", bills);

import { fetch as fetchShirts } from "../controllers/shirtController";
import { create } from "../controllers/registration/registrationController";

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/shirts/fetch/", async (req: Request, res: Response) => {
  const data = await fetchShirts();
  res.json(data);
});

export default router;
