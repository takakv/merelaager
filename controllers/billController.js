const db = require("../models/database");
const billGenerator = require("./billGenerator");

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
