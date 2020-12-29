const express = require("express");
const router = express.Router();

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.info;

const url_prefix = "info/";

router.get("/", (req, res, next) => {
  res.render("info", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    body_class: "info",
  });
});

router.get("/vahetused/", (req, res, next) => {
  res.render("vahetused", {
    title: meta.vahetused.title,
    description: meta.vahetused.description,
    url_path: url_prefix + "vahetused/",
    body_class: "vahetused",
  });
});

router.get("/laagrist/", (req, res, next) => {
  res.render("laagrist", {
    title: meta.laagrist.title,
    description: meta.laagrist.description,
    url_path: url_prefix + "laagrist/",
    body_class: "laagrist",
  });
});

router.get("/maksmine/", (req, res, next) => {
  res.render("maksmine", {
    title: meta.maksmine.title,
    description: meta.maksmine.description,
    url_path: url_prefix + "maksmine/",
    body_class: "maksmine",
  });
});

router.get("/kkk/", (req, res, next) => {
  res.render("kkk", {
    title: meta.kkk.title,
    description: meta.kkk.description,
    url_path: url_prefix + "kkk/",
    body_class: "kkk",
  });
});

router.get("/ajalugu/", (req, res, next) => {
  res.render("ajalugu", {
    title: meta.ajalugu.title,
    description: meta.ajalugu.description,
    url_path: url_prefix + "ajalugu/",
    body_class: "ajalugu",
  });
});

module.exports = router;
