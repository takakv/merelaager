require("dotenv").config();
const MailService = require("./MailService");
const db = require("../models/database");
const fs = require("fs");
const axios = require("axios");
const billGenerator = require("./billGenerator");

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

const mailService = new MailService();

const Camper = db.campers;

const unlockTime = new Date(Date.parse("01 Jan 2021 11:59:30 UTC"));
const now = new Date().getTime();
const eta = unlockTime - now;

let unlocked = process.env.NODE_ENV === "dev";

if (process.env.NODE_ENV === "prod") {
  setTimeout(() => {
    unlocked = true;
  }, eta);
}

const openSlots = {
  1: {
    resBoys: 20,
    resGirls: 20,
  },
  2: {
    resBoys: 20,
    resGirls: 20,
  },
  3: {
    resBoys: 16,
    resGirls: 24,
  },
  4: {
    resBoys: 20,
    resGirls: 20,
  },
};

const globalRegCount = {
  "1v": {},
  "2v": {},
  "3v": {},
  "4v": {},
};

const getBillNr = async () => {
  const previousBill = await Camper.findOne({
    order: [["billNr", "DESC"]],
  });
  if (previousBill) {
    return previousBill.billNr + 1;
  }
  return 1;
};

exports.create = async (req, res) => {
  if (!unlocked) return res.status(409).send("Vara veel!");

  // Get the children.
  const childCount = parseInt(req.body["childCount"]);
  const campers = [];
  const errors = [];

  for (let i = 1; i <= childCount; ++i) {
    let gender, birthday;

    const idCode = req.body[`idCode-${i}`];

    if (idCode) {
      if (idCode.length !== 11) {
        errors.push("Format error: length");
        return res.status(500).send("Format error: length");
      }

      switch (idCode.charAt(0)) {
        case "5":
          gender = "Poiss";
          break;
        case "6":
          gender = "Tüdruk";
          break;
        default:
          errors.push("Format error: gender");
          return res.status(500).send("Format error: gender");
      }

      // TODO: add error checking.
      const year = 2000 + parseInt(idCode.slice(1, 3));
      // Js counts month from 0 - 11.
      const month = parseInt(idCode.slice(3, 5)) - 1;
      const day = parseInt(idCode.slice(5, 7));
      birthday = new Date(year, month, day);
    } else {
      // TODO: add error checking.
      birthday = req.body[`bDay-${i}`];

      switch (req.body[`gender-${i}`]) {
        case "M":
          gender = "Poiss";
          break;
        case "F":
          gender = "Tüdruk";
          break;
        default:
          errors.push("Format error: gender");
          return res.status(500).send("Format error: gender");
      }
    }

    const isRookie = req.body[`newAtCamp-${i}`] === "true";
    const isEmsa = req.body[`emsa-${i}`] === "true";

    campers.push({
      name: req.body[`name-${i}`],
      idCode: req.body[`idCode-${i}`],
      gender: gender,
      birthday: birthday,
      isOld: !isRookie,
      shift: req.body[`vahetus-${i}`],
      tsSize: req.body[`shirtsize-${i}`],
      addendum: req.body[`addendum-${i}`],
      road: req.body[`road-${i}`],
      city: req.body[`city-${i}`],
      county: req.body[`county-${i}`],
      country: req.body[`country-${i}`],
      isEmsa: isEmsa,
      contactName: req.body.guardian_name,
      contactNumber: req.body.guardian_phone,
      contactEmail: req.body.guardian_email,
      backupTel: req.body.alt_phone,
    });
  }

  let regCount = 0;
  const billNr = await getBillNr();

  // Number of distinct shifts in a single registration.
  // This avoids async calls returning the wrong number of slots.
  const distinctShifts = [];
  // await updateDbSlotData();

  for (let i = 0; i < childCount; ++i) {
    const shift = campers[i].shift;
    const gender = campers[i].gender;

    if (distinctShifts.indexOf(`${shift}+${gender}`) === -1) {
      globalRegCount[shift][gender] = await Camper.count({
        where: {
          shift: shift,
          gender: gender,
          isRegistered: true,
        },
      });
      distinctShifts.push(`${shift}+${gender}`);
    }

    const shiftNr = parseInt(campers[i].shift[0]);

    if (
      (gender === "Poiss" &&
        globalRegCount[shift][gender] < openSlots[shiftNr].resBoys) ||
      (gender === "Tüdruk" &&
        globalRegCount[shift][gender] < openSlots[shiftNr].resGirls)
    ) {
      campers[i].isRegistered = true;
      campers[i].billNr = billNr;

      ++globalRegCount[shift][gender];
      ++regCount;
    }

    try {
      await Camper.create(campers[i]);
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .send(
          "Tekkis ootamatu tõrge. Palun võtke kohe meiega ühendust aadressil webmaster@merelaager.ee."
        );
    }
  }

  const price = calculatePrice(campers);

  if (regCount) {
    res.redirect("../edu/");
    const billName = await billGenerator.generatePDF(campers, billNr, regCount);
    mailer(campers, price, billName, regCount, billNr);
  } else {
    res.redirect("../reserv/");
    mailService.sendFailureMail(campers);
  }

  axios.post(process.env.URL, openSlots);
};

const mailer = (campers, price, pdfName, regCount, billNr) => {
  mailService.sendConfirmationMail(campers, price, pdfName, regCount, billNr);
};

const calculatePrice = (campers) => {
  let price = 0;
  campers.forEach((camper) => {
    if (!camper.isRegistered) return;
    price += shiftData[camper.shift].price;
    if (camper.city.toLowerCase().trim() === "tallinn") price -= 20;
    else if (camper.isOld) price -= 10;
  });
  return price;
};

exports.migrateShifts = async () => {
  const campers = await Camper.findAll();

  for (const camper of campers) {
    camper.shiftNr = parseInt(camper["oldShift"][0]);
    await camper.save();
  }
};
