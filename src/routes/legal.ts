import fs from "fs";
import express, { Request, Response } from "express";

const router = express.Router();

let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.legal;

const url_prefix = "oiguslik/";

router.get("/", (req: Request, res: Response) => {
  res.render("legal", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    body_class: "legal",
  });
});

router.get("/kasutajatingimused/", (req: Request, res: Response) => {
  res.render("tos", {
    title: meta.tingimused.title,
    description: meta.tingimused.description,
    url_path: url_prefix + "kasutajatingimused/",
    body_class: "legal",
  });
});

router.get("/isikuandmed/", (req: Request, res: Response) => {
  res.render("privacy", {
    title: meta.isikuandmed.title,
    description: meta.isikuandmed.description,
    url_path: url_prefix + "isikuandmed/",
    body_class: "legal",
  });
});

router.get("/kupsised/", (req: Request, res: Response) => {
  res.render("cookies", {
    title: meta.cookies.title,
    description: meta.cookies.description,
    url_path: url_prefix + "kupsised/",
    body_class: "legal",
  });
});

router.get("/brand/", (req: Request, res: Response) => {
  res.render("brand", {
    title: meta.brand.title,
    description: meta.brand.description,
    url_path: url_prefix + "brand/",
    body_class: "legal",
  });
});

export default router;
