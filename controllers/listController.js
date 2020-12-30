require("dotenv").config();
const db = require("../models/database");

const Camper = db.campers;

exports.generate = async (req, res) => {
  if (req.body["password"] !== process.env.LISTPASS) return false;
  const children = await Camper.findAll({
    // where: {
    //   vahetus: "3v",
    // },
    order: [["arveNr", "ASC"]],
  });
  const childData = [];
  children.forEach((child) => {
    const data = {
      name: child["nimi"],
      gender: child["sugu"],
      idCode: child["isikukood"],
      bDay: child["synnipaev"],
      isOld: child["vana_olija"] ? "jah" : "ei",
      shift: child["vahetus"],
      tShirtSize: child["ts_suurus"],
      city: child["linn"],
      county: child["maakond"],
      billNr: child["arveNr"],
      contact: `${child["kontakt_nimi"]}, ${child["kontakt_email"]}, ${child["kontakt_number"]}`,
      registered: child["registreeritud"] ? "jah" : "ei",
    };
    childData.push(data);
  });
  return childData;
};
