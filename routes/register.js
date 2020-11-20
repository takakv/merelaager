const express = require("express");
const router = express.Router();

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.broneeri;

router.get("/", (req, res, next) => {
  res.render("broneeri", {
    title: meta.title,
    description: meta.description,
    body_class: "broneeri",
  });
});

// router.post("/login/", pass)

module.exports = router;
