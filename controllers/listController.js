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
  const returnData = {
    childData: [],
    girlCount: 0,
    boyCount: 0,
    totalCount: 0,
    extraBoys: 0,
    extraGirls: 0,
  };
  children.forEach((child) => {
    if (child["isRegistered"]) {
      ++returnData.totalCount;
      if (child["gender"] === "Poiss") ++returnData.boyCount;
      else ++returnData.girlCount;
    } else {
      if (child["gender"] === "Poiss") ++returnData.extraBoys;
      else ++returnData.extraGirls;
    }
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
    returnData.childData.push(data);
  });
  return returnData;
};

exports.update = async (req, res) => {
  // if (req.body.key !== process.env.BOSSPASS) return false;
  const str = req.body.id;
  const breakpoint = str.indexOf("-");
  const id = str.substring(0, breakpoint);
  const action = str.substring(breakpoint + 1);
  const child = await Camper.findByPk(id);
  switch (action) {
    case "reg":
      await Camper.update(
        {
          isRegistered: !child.isRegistered,
        },
        {
          where: {
            id: id,
          },
        }
      );
      break;
    case "a":
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
      break;
    default:
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
      break;
  }
  return true;
};
