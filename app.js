const express = require("express");
const app = express();
const port = 3000;

const handlebars = require("express-handlebars");
const fs = require("fs");

app.set("view engine", "hbs");

app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
    defaultView: "index",
    defaultLayout: "default",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
  })
);

app.use(express.static("public"));

let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));

app.get("/", (req, res, next) => {
  res.render("index", {
    layout: "landing",
    title: meta.homepage.title,
    description: meta.homepage.description,
  });
});

app.get("/meeskond/", (req, res, next) => {
  res.render("meeskond", {
    title: meta.meeskond.title,
    description: meta.meeskond.description,
  });
});

app.get("/ajalugu/", (req, res, next) => {
  res.render("ajalugu", {
    title: meta.ajalugu.title,
    description: meta.ajalugu.description,
    body_class: "ajalugu",
  });
});

app.get("/pildid/", (req, res, next) => {
  res.render("pildid", {
    title: meta.pildid.title,
    description: meta.pildid.description,
    body_class: "pildid",
  });
});

const infoRouter = require("./routes/info");
app.use("/info/", infoRouter);

app.listen(port, () => console.log(`Listening on port ${port}`));
