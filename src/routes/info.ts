import fs from "fs";
import express, { Router, Request, Response } from "express";
import path from "path";

const router: Router = express.Router();

const metaPath = path.join(__dirname, "../../data/metadata.json");
let meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
meta = meta.info;

const url_prefix: string = "info/";

router.get("/", (req: Request, res: Response) => {
  res.render("info", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    body_class: "info",
  });
});

router.get("/vahetused/", (req: Request, res: Response) => {
  res.render("vahetused", {
    title: meta.vahetused.title,
    description: meta.vahetused.description,
    url_path: url_prefix + "vahetused/",
    body_class: "vahetused",
  });
});

router.get("/laagrist/", (req: Request, res: Response) => {
  res.render("laagrist", {
    title: meta.laagrist.title,
    description: meta.laagrist.description,
    url_path: url_prefix + "laagrist/",
    body_class: "laagrist",
  });
});

router.get("/maksmine/", (req: Request, res: Response) => {
  res.render("maksmine", {
    title: meta.maksmine.title,
    description: meta.maksmine.description,
    url_path: url_prefix + "maksmine/",
    body_class: "maksmine",
  });
});

router.get("/kkk/", (req: Request, res: Response) => {
  res.render("kkk", {
    title: meta.kkk.title,
    description: meta.kkk.description,
    url_path: url_prefix + "kkk/",
    body_class: "kkk",
  });
});

router.get("/ajalugu/", (req: Request, res: Response) => {
  res.render("ajalugu", {
    title: meta.ajalugu.title,
    description: meta.ajalugu.description,
    url_path: url_prefix + "ajalugu/",
    body_class: "ajalugu",
  });
});

export default router;
