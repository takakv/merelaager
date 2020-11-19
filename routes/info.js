const express = require("express");
const router = express.Router();

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.info;

router.get("/", (req, res, next) => {
  res.render("info", {
    title: meta.title,
    description: meta.description,
    body_class: "info",
  });
});

router.get("/vahetused/", (req, res, next) => {
  res.render("vahetused", {
    title: meta.vahetused.title,
    description: meta.vahetused.description,
    body_class: "vahetused",
  });
});

router.get("/laagrist/", (req, res, next) => {
  res.render("laagrist", {
    title: meta.laagrist.title,
    description: meta.laagrist.description,
    body_class: "laagrist",
  });
});

router.get("/maksmine/", (req, res, next) => {
  res.render("maksmine", {
    title: meta.maksmine.title,
    description: meta.maksmine.description,
    body_class: "maksmine",
  });
});

router.get("/kkk/", (req, res, next) => {
  res.render("kkk", {
    title: meta.kkk.title,
    description: meta.kkk.description,
    body_class: "kkk",
  });
});

module.exports = router;
