const express = require("express");
const router = express.Router();

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.info;

const url_prefix = "oiguslik/";

router.get("/", (req, res, next) => {
  res.render("oiguslik", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    body_class: "legal",
  });
});

router.get("/kasutajatingimused/", (req, res, next) => {
  res.render("tos", {
    title: meta.vahetused.title,
    description: meta.vahetused.description,
    url_path: url_prefix + "kasutajatingimused/",
    body_class: "",
  });
});

router.get("/isikuandmed/", (req, res, next) => {
  res.render("privacy", {
    title: meta.vahetused.title,
    description: meta.vahetused.description,
    url_path: url_prefix + "isikuandmed/",
    body_class: "",
  });
});

module.exports = router;
