const db = require("../models/database");
const Camper = db.campers;

exports.create = (req, res) => {
  let idcode = req.body.idcode;
  let gender;
  let bday;
  if (idcode) {
    switch (idcode.charAt(0)) {
      case "5":
        gender = "P";
        break;
      case "6":
        gender = "T";
        break;
    }
    const year = 2000 + parseInt(idcode.slice(1, 3));
    // Js counts month from 0 - 11.
    const month = parseInt(idcode.slice(3, 5)) - 1;
    const day = parseInt(idcode.slice(5, 7));
    bday = new Date(year, month, day);
  }
  const camper = {
    nimi: req.body.name,
    isikukood: idcode,
    sugu: gender,
    synnipaev: bday,
    vana_olija: !!req.body.isFamiliar,
  };

  Camper.create(camper)
    .then((data) => res.send(data))
    .catch((err) =>
      res.status(500).send({
        message: err.message || "Midagi läks nihu.",
      })
    );
};
