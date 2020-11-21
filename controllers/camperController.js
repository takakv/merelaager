const db = require("../models/database");
const Camper = db.campers;

exports.create = (req, res) => {
  let idCode = req.body["idCode-1"];
  let gender = req.body["gender-1"];
  let birthday = req.body["bDay-1"];
  if (idCode) {
    switch (idCode.charAt(0)) {
      case "5":
        gender = "Poiss";
        break;
      case "6":
        gender = "Tüdruk";
        break;
    }
    const year = 2000 + parseInt(idCode.slice(1, 3));
    // Js counts month from 0 - 11.
    const month = parseInt(idCode.slice(3, 5)) - 1;
    const day = parseInt(idCode.slice(5, 7));
    birthday = new Date(year, month, day);
  } else if (gender) {
    switch (gender) {
      case "M":
        gender = "Poiss";
        break;
      case "F":
        gender = "Tüdruk";
        break;
    }
  }
  const camper = {
    nimi: req.body["name-1"],
    isikukood: idCode,
    sugu: gender,
    synnipaev: birthday,
    aasta_laagris: req.body["yearsAtCamp-1"],
    vahetus: req.body["vahetus-1"],
    ts_suurus: req.body["shirtsize-1"],
    linn: req.body["city-1"],
    maakond: req.body["county-1"],
    riik: req.body["country-1"],
    kontakt_nimi: req.body.guardian_name,
    kontakt_number: req.body.guardian_phone,
    kontakt_email: req.body.guardian_email,
    varu_tel: req.body.alt_phone,
  };

  Camper.create(camper)
    .then((data) => res.send(data))
    .catch((err) =>
      res.status(500).send({
        message: err.message || "Midagi läks nihu.",
      })
    );
};
