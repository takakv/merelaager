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
    defaultView: "default",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
  })
);

app.use(express.static("public"));

let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));

app.get("/", (req, res, next) => {
  res.render("index", {
    layout: "default",
    title: meta.homepage.title,
    description: meta.homepage.description,
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
