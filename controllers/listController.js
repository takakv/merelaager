require("dotenv").config();
const db = require("../models/database");

const Camper = db.campers;

exports.generate = async (req, res) => {
  if (req.body["password"] !== process.env.LISTPASS) return false;
  const children = await Camper.findAll({
    // where: {
    //   vahetus: "3v",
    // },
    order: [["billNr", "ASC"]],
  });
  const childData = [];
  children.forEach((child) => {
    const data = {
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
      prePaid: child["prePaid"] ? "Ok" : "-",
      fullPaid: child["fullPaid"] ? "Ok" : "-",
    };
    childData.push(data);
  });
  return childData;
};
