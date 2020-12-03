const express = require("express");
const slashes = require("connect-slashes");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const exphbs = require("express-handlebars");
const fs = require("fs");

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

app.get("/ajalugu/", (req, res, next) => {
  res.render("ajalugu", {
    title: meta.ajalugu.title,
    description: meta.ajalugu.description,
    url_path: "ajalugu/",
    body_class: "ajalugu",
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

const infoRouter = require("./routes/info");
app.use("/info/", infoRouter);

const adminRouter = require("./routes/admin");
app.use("/kambuus/", adminRouter);

const registerRouter = require("./routes/register");
app.use("/registreerimine/", registerRouter);

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

const port = process.env.PORT;
app.listen(port, () => console.log(`Listening on port ${port}`));

const db = require("./models/database");
db.sequelize.sync({ alter: true });
