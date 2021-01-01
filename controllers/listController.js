require("dotenv").config();
const db = require("../models/database");
const passwords = [
  process.env.P1,
  process.env.BOSSPASS,
  process.env.P3,
  process.env.P4,
];

const Camper = db.campers;

exports.generate = async (req, res) => {
  if (!passwords.includes(req.body["password"])) return false;
  const shift = `${passwords.indexOf(req.body["password"]) + 1}v`;
  let children;
  if (shift !== "2v")
    children = await Camper.findAll({
      where: {
        shift: shift,
      },
      order: [
        ["shift", "ASC"],
        ["id", "ASC"],
      ],
    });
  else {
    children = await Camper.findAll({
      order: [
        ["shift", "ASC"],
        ["id", "ASC"],
      ],
    });
  }
  const childData = [];
  children.forEach((child) => {
    const data = {
      id: child["id"],
      name: child["name"],
      gender: child["gender"],
      idCode: child["idCode"],
      bDay: child["birthday"],
      isOld: child["isOld"] ? "jah" : "ei",
      shift: child["shift"],
      tShirtSize: child["tsSize"],
      city: child["city"],
      county: child["county"],
      billNr: child["billNr"],
      contact: `${child["contactName"]}, ${child["contactEmail"]}, ${child["contactNumber"]}`,
      registered: child["isRegistered"] ? "jah" : "ei",
      prePaid: child["prePaid"]
        ? { name: "Ok", class: "ok" }
        : { name: "Nop", class: "nop" },
      fullPaid: child["fullPaid"]
        ? { name: "Ok", class: "ok" }
        : { name: "Nop", class: "nop" },
    };
    childData.push(data);
  });
  return childData;
};

exports.update = async (req, res) => {
  if (req.body.key !== process.env.BOSSPASS) return false;
  const id = parseInt(req.body.id[0]);
  const action = req.body.id[1];
  const child = await Camper.findByPk(id);
  if (action === "a") {
    await Camper.update(
      {
        prePaid: !child.prePaid,
      },
      {
        where: {
          id: id,
        },
      }
    );
  } else {
    await Camper.update(
      {
        fullPaid: !child.fullPaid,
      },
      {
        where: {
          id: id,
        },
      }
    );
  }
  return true;
};
