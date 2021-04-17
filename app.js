require("dotenv").config();
const fs = require("fs");
const express = require("express");
const exphbs = require("express-handlebars");
const slashes = require("connect-slashes");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const hbs = exphbs.create({
  extname: "hbs",
  defaultView: "index",
  defaultLayout: "default",
  layoutsDir: __dirname + "/views/layouts/",
  partialsDir: __dirname + "/views/partials/",
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

let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.sendFile("/robots.txt", {
    root: "./public/",
  });
});

app.get("/sitemap.txt", (req, res) => {
  res.type("text/plain");
  res.sendFile("/sitemap.txt", {
    root: "./public/",
  });
});

app.get("/", (req, res, next) => {
  res.render("index", {
    layout: "landing",
    title: meta.homepage.title,
    description: meta.homepage.description,
    body_class: "landing",
  });
});

app.get("/meeskond/", (req, res, next) => {
  res.render("meeskond", {
    title: meta.meeskond.title,
    description: meta.meeskond.description,
    url_path: "meeskond/",
    body_class: "meeskond",
  });
});

app.get("/lastenurk/", (req, res, next) => {
  res.render("lastenurk", {
    title: meta.lastenurk.title,
    description: meta.lastenurk.description,
    url_path: "lastenurk/",
    body_class: "lastenurk",
  });
});

app.get("/pildid/", (req, res, next) => {
  res.render("pildid", {
    title: meta.pildid.title,
    description: meta.pildid.description,
    url_path: "pildid/",
    body_class: "pildid",
  });
});

app.get("/sisukaart/", (req, res) => {
  res.render("sitemap", {
    title: meta.sitemap.title,
    description: meta.sitemap.description,
    url_path: "sisukaart/",
  });
});

const infoRouter = require("./routes/info");
app.use("/info/", infoRouter);

const registerRouter = require("./routes/register");
app.use("/registreerimine/", registerRouter);

const legal = require("./routes/legal");
app.use("/oiguslik/", legal);

const adminpanel = require("./routes/adminpanel");
app.use("/kambyys/", adminpanel);

const api = require("./routes/api");
app.use("/api/", api);

app.get("/broneerimine/", (req, res, next) => {
  res.redirect("/registreerimine/");
});

app.use((req, res, next) => {
  res.status(404).render("404", {
    layout: "metadata",
    title: "Kaardistamata asukoht",
    description: "Asute tundmatutes vetes. See leht on kaardistamata...",
    url_path: "404/",
    body_class: "errorpage",
  });
});

const db = require("./models/database");

const runApp = async () => {
  try {
    await db.sequelize.sync({ alter: true });
    const port = process.env.PORT;
    app.listen(port, () => console.log(`Listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

runApp().catch(console.error);

require("./models/bills");
