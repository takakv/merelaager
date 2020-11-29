const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.broneeri;

router.get("/", (req, res, next) => {
  res.render("registreerimine", {
    title: meta.title,
    description: meta.description,
    body_class: "registration",
    script_path: "/media/scripts/registration.js",
  });
});

const urlEncParser = bodyParser.urlencoded({ extended: false });

const campers = require("../controllers/camperController");

router.post("/register/", urlEncParser, campers.create);

module.exports = router;
