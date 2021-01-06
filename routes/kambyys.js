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

router.post(
  "/nimekiri/update/",
  [urlEncParser, bodyParser.json()],
  async (req, res) => {
    const status = await list.update(req, res);
    if (!status) res.status(403).send();
    res.status(200).end();
  }
);

const prices = require("../controllers/priceController");

router.post("/nimekiri/priceupdate/", [urlEncParser, bodyParser.json()], prices.updateAll);

router.post(/nimekiri/, [urlEncParser, bodyParser.json()], async (req, res) => {
  const data = await list.generate(req, res);
  if (!data) {
    res.status(403).send("Vale salasõna");
    return;
  }
  const isBoss = req.body["password"] === process.env.BOSSPASS;
  res.render("camperList", {
    layout: "metadata",
    title: "Nimekiri",
    description: "Laagrisolijate nimekiri",
    url_path: url_prefix + "nimekiri/",
    body_class: "camper-list",
    boss: isBoss,
    script_path: "/media/scripts/camperList.js",
    key: req.body["password"],
    data: data,
  });
});

module.exports = router;
