const db = require("../models/database");
const path = require("path");
const billGenerator = require("./billGenerator");
const fs = require("fs");

const Camper = db.campers;

exports.create = async (req, res) => {
  const children = await Camper.findAll({
    where: {
      kontakt_email: req.body["meil"],
    },
  });
  if (!children.length) {
    res.status(404).send("Pole sellist meiliaadressi.");
    return;
  }
  const campers = [];
  children.forEach((child) => {
    if (child["registreeritud"]) campers.push(child);
  });
  const billNr = children[0].arveNr;
  if (campers.length) {
    const billName = await billGenerator.generatePDF(
      campers,
      billNr,
      campers.length
    );
    res.sendFile(`${billName}`, {
      root: "./data/arved",
    });
  } else res.status(404).send("Pole registreeritud lapsi.");
};

exports.fetch = async (req, res) => {
  const child = await Camper.findOne({
    where: {
      kontakt_email: req.body["meil"],
    },
  });
  if (!child) {
    res.status(404).send("Pole sellist meiliaadressi.");
    return;
  }
  const billName = billGenerator.getName(child);
  const loc = `${path.join(__dirname, "../")}data/arved/${billName}`;
  fs.access(loc, fs.F_OK, (err) => {
    if (err) {
      res.status(404).send("Pole olemasolevat arvet.");
    } else {
      res.sendFile(`${billName}`, {
        root: "./data/arved",
      });
    }
  });
};
