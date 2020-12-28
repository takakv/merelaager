const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.info;

const url_prefix = "kambyys/";
const urlEncParser = bodyParser.urlencoded({ extended: false });

router.get("/", (req, res, next) => {
  res.send("Keelatud");
});

router.get("/arvegeneraator/", (req, res, next) => {
  res.render("bill_generator", {
    layout: "metadata",
    title: "Arvegeneraator",
    description: "Genereerib arveid.",
    url_path: url_prefix + "arvegeneraator/",
    body_class: "",
    script_path: "/media/scripts/billGen.js",
  });
});

const bill = require("../controllers/billController");

router.post(
  "/arvegeneraator/generate/",
  [urlEncParser, bodyParser.json()],
  bill.create
);

router.post(
  "/arvegeneraator/fetch/",
  [urlEncParser, bodyParser.json()],
  bill.fetch
);

const list = require("../controllers/listController");

router.get("/nimekiri/", (req, res) => {
  res.render("camperListAuth", {
    layout: "metadata",
    title: "Nimekiri",
    description: "Laagrisolijate nimekiri",
    url_path: url_prefix + "nimekiri/",
    body_class: "",
  });
});

router.post(/nimekiri/, [urlEncParser, bodyParser.json()], async (req, res) => {
  const childData = await list.generate(req, res);
  if (!childData) {
    res.status(403).send("Vale salasõna");
    return;
  }
  res.render("camperList", {
    layout: "metadata",
    title: "Nimekiri",
    description: "Laagrisolijate nimekiri",
    url_path: url_prefix + "nimekiri/",
    body_class: "",
    campers: childData,
  });
});

module.exports = router;
