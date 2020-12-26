const express = require("express");
const router = express.Router();

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.legal;

const url_prefix = "oiguslik/";

router.get("/", (req, res, next) => {
  res.render("legal", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    body_class: "legal",
  });
});

router.get("/kasutajatingimused/", (req, res, next) => {
  res.render("tos", {
    title: meta.tingimused.title,
    description: meta.tingimused.description,
    url_path: url_prefix + "kasutajatingimused/",
    body_class: "legal",
  });
});

router.get("/isikuandmed/", (req, res, next) => {
  res.render("privacy", {
    title: meta.isikuandmed.title,
    description: meta.isikuandmed.description,
    url_path: url_prefix + "isikuandmed/",
    body_class: "legal",
  });
});

router.get("/kupsised/", (req, res, next) => {
  res.render("cookies", {
    title: meta.cookies.title,
    description: meta.cookies.description,
    url_path: url_prefix + "kupsised/",
    body_class: "legal",
  });
});

router.get("/brand/", (req, res, next) => {
  res.render("brand", {
    title: meta.vahetused.title,
    description: meta.vahetused.description,
    url_path: url_prefix + "brand/",
    body_class: "legal",
  });
});

module.exports = router;
