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

router.post("/register/", urlEncParser, create);

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

let spots = {
  1: { M: 20, F: 20 },
  2: { M: 20, F: 20 },
  3: { M: 20, F: 20 },
  4: { M: 20, F: 20 },
  5: { M: 20, F: 20 },
};

// Gather slot data
// for (const [key, value] of Object.entries(spots)) {
//   slots.findByPk(key).then((count) => {
//     value.boys = count.boySlots;
//     value.girls = count.girlSlots;
//   });
// }

type client = {
  id: number;
  res: Response;
};

let clients: client[] = [];

const sendEventsToAll = () => {
  clients.forEach((c) => c.res.write(`data: ${JSON.stringify(spots)}\n\n`));
};

router.post(
  "/events/",
  [urlEncParser, bodyParser.json()],
  (req: Request, res: Response) => {
    spots = req.body;
    sendEventsToAll();
    res.sendStatus(200);
  }
);

router.get("/events/", async (req: Request, res: Response) => {
  // Headers
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
  res.writeHead(200, headers);

  const clientId = Date.now();
  console.log(`${clientId} Connection opened`);
  const newClient: client = {
    id: clientId,
    res,
  };
  clients.push(newClient);

  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((c) => c.id !== clientId);
  });

  res.write("retry: 10000\n\n");
  res.write(`data: ${JSON.stringify(spots)}\n\n`);
});

export default router;
