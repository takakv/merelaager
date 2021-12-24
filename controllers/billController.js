const db = require("../models/database");
const path = require("path");
const billGenerator = require("./billGenerator");
const fs = require("fs");

const Camper = db.registrations;

const bulkQueryByEmail = (contactEmail) => {
  return Camper.findAll({
    where: {
      contactEmail,
    },
  });
};

const queryByEmail = (contactEmail) => {
  return Camper.findOne({
    where: {
      contactEmail,
    },
  });
};

const getBillNr = async () => {
  const previousBill = await Camper.findOne({
    order: [["billNr", "DESC"]],
  });
  if (previousBill) {
    return previousBill.billNr + 1;
  }
  return 1;
};

exports.create = async (req, res) => {
  const children = await bulkQueryByEmail(req.params["email"]);

  if (!children.length) {
    res.status(404).send("Pole sellist meiliaadressi.");
    return;
  }
  const campers = [];
  let billNr;
  children.forEach((child) => {
    if (!billNr && child["billNr"]) billNr = child["billNr"];
    if (child["isRegistered"]) campers.push(child);
  });
  if (!billNr) {
    billNr = await getBillNr();
    await children.forEach((child) => {
      child.update({
        billNr: billNr,
      });
    });
  }
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
  const child = await queryByEmail(req.params["email"]);

  if (!child) {
    res.status(404).send("Pole sellist meiliaadressi");
    return;
  }

  const billName = billGenerator.getName(child);
  const loc = `${path.join(__dirname, "../")}data/arved/${billName}`;

  fs.access(loc, fs.F_OK, (err) => {
    if (err) {
      res.status(404).send("Puudub olemasolev arve");
    } else {
      res.sendFile(`${billName}`, {
        root: "./data/arved",
      });
    }
  });
};
