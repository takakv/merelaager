import fs from "fs";
import path from "path";

import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";

import cors from "cors";
import slashes from "connect-slashes";
import { create, ExpressHandlebars } from "express-handlebars";

require("dotenv").config();

const app: Application = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const hbs: ExpressHandlebars = create({
  extname: "hbs",
  defaultLayout: "default",
  layoutsDir: path.join(__dirname, "..", "/views/layouts/"),
  partialsDir: path.join(__dirname, "..", "/views/partials/"),
  helpers: {
    times: (n, block) => {
      let accum = "";
      for (let i = 1; i <= 4; ++i) {
        accum += block.fn(i);
      }
      return accum;
    },
  },
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

app.use(express.static("public")).use(slashes());

const metaPath = path.join(__dirname, "../data/metadata.json");
const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

app.get("/robots.txt", (req: Request, res: Response) => {
  res.type("text/plain");
  res.sendFile("/robots.txt", {
    root: "./public/",
  });
});

app.get("/sitemap.txt", (req: Request, res: Response) => {
  res.type("text/plain");
  res.sendFile("/sitemap.txt", {
    root: "./public/",
  });
});

app.get("/", (req: Request, res: Response) => {
  res.render("index", {
    layout: "landing",
    title: meta.homepage.title,
    description: meta.homepage.description,
    body_class: "landing",
  });
});

app.get("/meeskond/", (req: Request, res: Response) => {
  res.render("meeskond", {
    title: meta.meeskond.title,
    description: meta.meeskond.description,
    url_path: "meeskond/",
    body_class: "meeskond",
  });
});

app.get("/lastenurk/", (req: Request, res: Response) => {
  res.render("lastenurk", {
    title: meta.lastenurk.title,
    description: meta.lastenurk.description,
    url_path: "lastenurk/",
    body_class: "lastenurk",
  });
});

import { renderPictures } from "./routes/pictures";

app.get("/pildid/", (req: Request, res: Response) => {
  const imageList = [];
  fs.readdirSync("./public/img").forEach((file) => {
    if (file !== ".gitkeep") imageList.push({ src: `../img/${file}` });
  });
  renderPictures(req, res, meta, imageList);
});

app.get("/sisukaart/", (req: Request, res: Response) => {
  res.render("sitemap", {
    title: meta.sitemap.title,
    description: meta.sitemap.description,
    url_path: "sisukaart/",
  });
});

import infoRouter from "./routes/info";

app.use("/info/", infoRouter);

import registerRouter from "./routes/register";

app.use("/registreerimine/", registerRouter);

import legal from "./routes/legal";

app.use("/oiguslik/", legal);

import api from "./routes/api";

app.use("/api/", api);

app.get("/broneerimine/", (req: Request, res: Response) => {
  res.redirect("/registreerimine/");
});

app.use((req: Request, res: Response) => {
  res.status(404).render("404", {
    layout: "metadata",
    title: "Kaardistamata asukoht",
    description: "Asute tundmatutes vetes. See leht on kaardistamata...",
    url_path: "404/",
    body_class: "errorpage",
  });
});

export const runApp = () => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`App listening on port ${port}`));
};
