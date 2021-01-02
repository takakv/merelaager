require("dotenv").config();
const MailService = require("./MailService");
const db = require("../models/database");
const { slots } = require("../models/bills");
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

const slotData = {
  1: {
    resBoys: 15,
    resGirls: 15,
  },
  2: {
    resBoys: 9,
    resGirls: 16,
  },
  3: {
    resBoys: 14,
    resGirls: 14,
  },
  4: {
    resBoys: 16,
    resGirls: 16,
  },
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

const updateDbSlotData = async () => {
  for (let i = 1; i <= 4; ++i) {
    slotData[i].boys =
      slotData[i].resBoys -
      (await Camper.count({
        where: {
          shift: `${i}v`,
          gender: "Poiss",
          isRegistered: 1,
        },
      }));

    slotData[i].girls =
      slotData[i].resGirls -
      (await Camper.count({
        where: {
          shift: `${i}v`,
          gender: "Tüdruk",
          isRegistered: 1,
        },
      }));
  }
};

exports.create = async (req, res) => {
  const billNr = await getBillNr();
  await updateDbSlotData();

  // Gather children
  const childCount = parseInt(req.body["childCount"]);
  let campers = [];
  let regCampers = 0;

  for (let i = 1; i < childCount + 1; ++i) {
    const hasIdCode = req.body[`useIdCode-${i}`] !== "false";
    const isRookie = req.body[`newAtCamp-${i}`] === "true";
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
      name: req.body[`name-${i}`],
      idCode: idCode,
      gender: gender,
      birthday: birthday,
      isOld: !isRookie,
      shift: req.body[`vahetus-${i}`],
      tsSize: req.body[`shirtsize-${i}`],
      addendum: req.body[`addendum-${i}`],
      road: req.body[`road-${i}`],
      city: req.body[`city-${i}`],
      country: req.body[`country-${i}`],
      county: req.body[`county-${i}`],
      isEmsa: isEmsa,
      contactName: req.body.guardian_name,
      contactNumber: req.body.guardian_phone,
      contactEmail: req.body.guardian_email,
      backupTel: req.body.alt_phone,
    });
  }

  if (unlocked) {
    for (let i = 0; i < childCount; ++i) {
      const shiftNr = parseInt(campers[i].shift[0]);
      const gender = campers[i].gender === "Poiss" ? "boys" : "girls";
      const dbLoc = {
        where: {
          shift: shiftNr,
        },
      };
      if (!isFull(slotData[shiftNr], gender)) {
        ++regCampers;
        campers[i].isRegistered = true;
        campers[i].billNr = billNr;
        if (gender === "boys") {
          await slots.update(
            {
              boySlots: --slotData[shiftNr].boys,
            },
            dbLoc
          );
        } else {
          await slots.update(
            {
              girlSlots: --slotData[shiftNr].girls,
            },
            dbLoc
          );
        }
      }
    }
    axios.post(process.env.URL, slotData);
    const price = calculatePrice(campers);
    try {
      const data = await Camper.bulkCreate(campers);
      // mailService.sendCampMasterEmail(campers, price, billNr, regCampers);
      if (regCampers) res.redirect("../edu/");
      else res.redirect("../reserv/");
      // res.send(data);
    } catch (err) {
      console.log(err);
      await res
        .status(500)
        .send(
          "Mingi väga, väga, väga suur jama juhtus. Palun võtke kohe meiega ühendust aadressil webmaster@merelaager.ee"
        );
    }
    if (regCampers) {
      const billName = await billGenerator.generatePDF(
        campers,
        billNr,
        regCampers
      );
      mailer(campers, price, billName, regCampers, billNr);
    } else mailService.sendFailureMail(campers);
  } else {
    res.send("Proovite siin häkkida jah? Ei saa :)");
  }
};

const mailer = (campers, price, pdfName, regCount, billNr) => {
  mailService.sendConfirmationMail(campers, price, pdfName, regCount, billNr);
};

const calculatePrice = (campers) => {
  let price = 0;
  campers.forEach((camper) => {
    if (!camper.isRegistered) return;
    price += shiftData[camper.shift].price;
    if (camper.city.toLowerCase() === "tallinn") price -= 20;
    else if (camper.isOld) price -= 10;
  });
  return price;
};

const isFull = (slot, gender) => {
  return slot[gender] - 1 < 0;
};
