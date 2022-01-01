import db from "../models/database";
const path = require("path");
const billGenerator = require("./billGenerator");
const fs = require("fs");

const Camper = db.registrations;
const Child = db.child;

const bulkQueryByEmail = (contactEmail) => {
  return Camper.findAll({ where: { contactEmail }, include: Child });
};

const queryByEmail = (contactEmail) => {
  return Camper.findOne({
    where: { contactEmail },
    attributes: ["contactName", "billNr"],
  });
};

const getBillNr = async () => {
  const previousBill = await Camper.findOne({
    order: [["billNr", "DESC"]],
    attributes: ["billNr"],
  });
  if (previousBill) {
    return previousBill.billNr + 1;
  }
  return 21001;
};

export const create = async (req, res) => {
  const children = await bulkQueryByEmail(req.params["email"]);

  if (!children.length) {
    res.status(404).send("Pole sellist meiliaadressi.");
    return;
  }

  const campers = [];
  const names = [];
  let billNr = 0;

  children.forEach((child) => {
    if (billNr === 0 && child["billNr"]) billNr = child["billNr"];
    if (child["isRegistered"]) {
      campers.push(child);
      names.push(child.child.name);
    }
  });

  if (!billNr) {
    billNr = await getBillNr();
    await children.forEach((child) => {
      child.update({ billNr: billNr });
    });
  }
  if (campers.length) {
    const contact = {
      name: campers[0].contactName,
      email: campers[0].contactEmail,
    };

    const billName = await billGenerator.generatePDF(
      campers,
      names,
      contact,
      billNr,
      campers.length
    );

    res.sendFile(`${billName}`, {
      root: "./data/arved",
    });
  } else res.status(404).send("Pole registreeritud lapsi.");
};

export const fetch = async (req, res) => {
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
