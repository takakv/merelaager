import fs from "fs";
import path from "path";
import express, { Request, Response, Router } from "express";
import bodyParser from "body-parser";
import { create } from "../controllers/registration/registrationController";

const router: Router = express.Router();

const metaPath = path.join(__dirname, "../../data/metadata.json");
let meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
meta = meta.broneeri;

const url_prefix: string = "registreerimine/";

router.get("/", (req: Request, res: Response) => {
  res.render("registreerimine", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    body_class: "registration",
    script_path: "/media/scripts/registration.js",
  });
});

const urlEncParser = bodyParser.urlencoded({ extended: false });

router.post("/register/", urlEncParser, async (req: Request, res: Response) => {
  await create(req, res);
});

router.get("/edu/", (req: Request, res: Response) => {
  res.render("success", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    layout: "metadata",
    body_class: "success",
  });
});

router.get("/reserv/", (req, res) => {
  res.render("reserv", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    layout: "metadata",
    body_class: "success",
  });
});

export default router;
