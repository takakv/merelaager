const db = require("../models/database");
const Camper = db.campers;

exports.create = (req, res) => {
  const childCount = parseInt(req.body["childCount"]);
  let campers = [];
  for (let i = 1; i < childCount + 1; ++i) {
    const hasIdCode = req.body[`hasIdCode-${i}`] !== "false";
    let idCode = req.body[`idCode-${i}`];
    let gender = req.body[`gender-${i}`];
    let birthday = req.body[`bDay-${i}`];
    if (hasIdCode && idCode) {
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
    campers.push({
      nimi: req.body[`name-${i}`],
      isikukood: idCode,
      sugu: gender,
      synnipaev: birthday,
      aasta_laagris: req.body[`yearsAtCamp-${i}`],
      vahetus: req.body[`vahetus-${i}`],
      ts_suurus: req.body[`shirtsize-${i}`],
      linn: req.body[`city-${i}`],
      maakond: req.body[`county-${i}`],
      riik: req.body[`country-${i}`],
      kontakt_nimi: req.body.guardian_name,
      kontakt_number: req.body.guardian_phone,
      kontakt_email: req.body.guardian_email,
      varu_tel: req.body.alt_phone,
    });
  }
  Camper.bulkCreate(campers)
    .then((data) => res.send(data))
    .catch((err) =>
      res.status(500).send({
        message: err.message || "Midagi läks nihu.",
      })
    );
};
