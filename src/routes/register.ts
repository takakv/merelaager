import fs from "fs";
import path from "path";
import express, { Request, Response, Router } from "express";
import bodyParser from "body-parser";
import { create } from "../controllers/registration/registrationController";
import { Registration } from "../db/models/Registration";
import { Child } from "../db/models/Child";
import { Shift } from "../db/models/Shift";

const router: Router = express.Router();

const metaPath = path.join(__dirname, "../../data/metadata.json");
let meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
meta = meta.broneeri;

const url_prefix: string = "registreerimine/";

// eslint-disable-next-line @typescript-eslint/require-await
router.get("/", async (req: Request, res: Response) => {
  // Count remaining shift slots.
  type remainingSlot = {
    M: number;
    F: number;
  };
  const remainingSlots: remainingSlot[] = [];

  for (let i = 0; i < 4; ++i) {
    const shiftNr = i + 1;

    const registrationCountM: number = await Registration.count({
      where: {
        shiftNr: shiftNr,
        isRegistered: true,
      },
      include: {
        model: Child,
        where: { gender: "M" },
      },
    });

    const registrationCountF: number = await Registration.count({
      where: {
        shiftNr: shiftNr,
        isRegistered: true,
      },
      include: {
        model: Child,
        where: { gender: "F" },
      },
    });

    const totalSlots: Shift = await Shift.findByPk(shiftNr, {
      attributes: ["boySlots", "girlSlots"],
    });

    const rmsM = totalSlots.boySlots - registrationCountM;
    const rmsF = totalSlots.girlSlots - registrationCountF;

    remainingSlots.push({
      M: rmsM < 0 ? 0 : rmsM,
      F: rmsF < 0 ? 0 : rmsF,
    });
  }

  res.render("registreerimine", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    body_class: "registration",
    script_path: "/media/scripts/registration.js",
    rm_1M: remainingSlots[0].M,
    rm_1F: remainingSlots[0].F,
    rm_2M: remainingSlots[1].M,
    rm_2F: remainingSlots[1].F,
    rm_3M: remainingSlots[2].M,
    rm_3F: remainingSlots[2].F,
    rm_4M: remainingSlots[3].M,
    rm_4F: remainingSlots[3].F,
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
