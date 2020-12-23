const nodemailer = require("nodemailer");
const mailGun = require("nodemailer-mailgun-transport");
const dotenv = require("dotenv");
const db = require("../models/database");
const Camper = db.campers;
dotenv.config();

exports.create = (req, res) => {
  const childCount = parseInt(req.body["childCount"]);
  let campers = [];
  for (let i = 1; i < childCount + 1; ++i) {
    const hasIdCode = req.body[`useIdCode-${i}`] !== "false";
    const isRookie = req.body[`newAtCAmp-${i}`] === "true";
    const isEmsa = req.body[`emsa-${i}`] === "true";
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
      vana_olija: !isRookie,
      vahetus: req.body[`vahetus-${i}`],
      ts_suurus: req.body[`shirtsize-${i}`],
      lisainfo: req.body[`addendum-${i}`],
      tanav: req.body[`road-${i}`],
      linn: req.body[`city-${i}`],
      riik: req.body[`country-${i}`],
      emsa: isEmsa,
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
  mailer()
    .then(() => console.log("Success"))
    .catch((error) => console.log(error));
};

const auth = {
  auth: {
    api_key: process.env.EMAIL_API,
    domain: process.env.EMAIL_SERV,
  },
};

const mailer = async () => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: process.env.EMAIL_HOST,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PWD,
    },
  });

  const meta = {
    from: "bronn@merelaager.ee",
    to: "webmaster@merelaager.ee",
    subject: "Test",
    text: "Test",
  };

  await transporter.sendMail(meta, (error, info) => {
    if (error) console.log(error);
    else console.log(info);
  });
};
