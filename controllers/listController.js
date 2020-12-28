const db = require("../models/database");

const Camper = db.campers;

exports.generate = async (req, res) => {
  const children = await Camper.findAll({
    where: {
      vahetus: "3v",
    },
    order: [["arveNr", "ASC"]],
  });
  const childData = [];
  children.forEach((child) => {
    const data = {
      "Nimi": child["nimi"],
      "Sugu": child["sugu"],
      "Sünnipäev": child["synnipaev"],
      "Vana olija": child["vana_olija"] ? "jah" : "ei",
      "Vahetus": child["vahetus"],
      "Tsärgi suurus": child["ts_suurus"],
      "Linn / vald / küla": child["linn"],
      "Arve nr": child["arveNr"],
      "Konktakt": `${child["kontakt_nimi"]}, ${child["kontakt_email"]}, ${child["kontakt_number"]}`,
      "Registreeritud": child["registreeritud"] ? "jah" : "ei",
    };
    childData.push(data);
  });
  res.send(childData);
};
