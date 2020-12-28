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
  })
});

const bill = require("../controllers/billController");

router.post("/arvegeneraator/generate/", urlEncParser, bill.create);

module.exports = router;
