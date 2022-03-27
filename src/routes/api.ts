import express, { Request, Response } from "express";
import bodyParser from "body-parser";

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

import auth from "./api/auth";

router.use("/auth", auth);

import account from "./api/account";

router.use("/su", account);

import override from "./api/override";

router.use("/override", override);

import pub from "./api/public";

router.use("/pb", pub);

// ---------- AUTH ZONE ------------------------------
import { verifyAccessToken } from "./Support Files/jwt";

router.use(verifyAccessToken);

import me from "./api/me";

router.use("/me", me);

import users from "./api/users";

router.use("/users", users);

import registrations from "./api/registrations";

router.use("/registrations", registrations);

import campers from "./api/campers";

router.use("/campers", campers);

import notes from "./api/notes";

router.use("/notes", notes);

import tents from "./api/tents";

router.use("/tents", tents);

import teams from "./api/teams";

router.use("/teams", teams);

import staff from "./api/staff";

router.use("/staff", staff);

// Disable since unneeded
// const users = require("./api/users");
// router.use("/users", users);

import {
  fetch as fetchBill,
  create as createBill,
} from "../controllers/billController";

router.post("/bills/:action/:email", async (req: Request, res: Response) => {
  if (!req.params["action"] || !req.params["email"]) {
    return res.sendStatus(400);
  }
  switch (req.params["action"]) {
    case "fetch":
      await fetchBill(req, res);
      break;
    case "create":
      await createBill(req, res);
      break;
    default:
      return res.sendStatus(404);
  }
});

import { fetch as fetchShirts } from "../controllers/shirtController";

router.get("/shirts/fetch/", async (req: Request, res: Response) => {
  const data = await fetchShirts();
  res.json(data);
});

export default router;
