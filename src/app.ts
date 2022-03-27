import fs from "fs";
import path from "path";
import dotenv from "dotenv";

import express, { Request, Response } from "express";
import { create, ExpressHandlebars } from "express-handlebars";
import bodyParser from "body-parser";
import slashes from "connect-slashes";

import axios from "axios";
import cors from "cors";

import swaggerUi from "swagger-ui-express";

import { renderPictures } from "./routes/pictures";
import infoRouter from "./routes/info";
import registerRouter from "./routes/register";
import legal from "./routes/legal";
import { availableSlots } from "./controllers/registration/registrationController";
import { RegisterRoutes } from "./routes/routes";

dotenv.config();

const app = express();

const allowedOrigins = ["https://sild.merelaager.ee", `http://localhost:8080`];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  // https://stackoverflow.com/a/59812348
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use("/api", api);

console.log(path.join(__dirname, "/routes/**/*.js"));

app.use("/api-docs", swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(
    // @ts-ignore
    swaggerUi.generateHTML(await import("./swagger.json"))
  );
});

const hbs: ExpressHandlebars = create({
  extname: "hbs",
  defaultLayout: "default",
  layoutsDir: path.join(__dirname, "..", "/views/layouts/"),
  partialsDir: path.join(__dirname, "..", "/views/partials/"),
  helpers: {
    times: (n: number, block: any) => {
      let accum = "";
      for (let i = 1; i <= n; ++i) {
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

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.sendFile("/robots.txt", {
    root: "./public/",
  });
});

app.get("/sitemap.txt", (_req, res) => {
  res.type("text/plain");
  res.sendFile("/sitemap.txt", {
    root: "./public/",
  });
});

app.get("/", (_req, res) => {
  res.render("index", {
    layout: "landing",
    title: meta.homepage.title,
    description: meta.homepage.description,
    body_class: "landing",
    header: process.env.TITLE || "Kohtumiseni suvel",
  });
});

app.get("/meeskond/", (_req, res) => {
  res.render("meeskond", {
    title: meta.meeskond.title,
    description: meta.meeskond.description,
    url_path: "meeskond/",
    body_class: "meeskond",
  });
});

app.get("/lastenurk/", (_req, res) => {
  res.render("lastenurk", {
    title: meta.lastenurk.title,
    description: meta.lastenurk.description,
    url_path: "lastenurk/",
    body_class: "lastenurk",
  });
});

app.get("/pildid/", (req, res) => {
  const imageList: object[] = [];
  fs.readdirSync("./public/img").forEach((file) => {
    if (file !== ".gitkeep") imageList.push({ src: `../img/${file}` });
  });
  renderPictures(req, res, meta, imageList);
});

app.get("/sisukaart/", (_req, res) => {
  res.render("sitemap", {
    title: meta.sitemap.title,
    description: meta.sitemap.description,
    url_path: "sisukaart/",
  });
});

app.use("/info/", infoRouter);

app.use("/registreerimine/", registerRouter);

app.use("/oiguslik/", legal);

app.get("/broneerimine/", (_req, res) => {
  res.redirect("/registreerimine/");
});

RegisterRoutes(app);

app.use((_req, res) => {
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
  axios.post(process.env.URL, availableSlots);
};
