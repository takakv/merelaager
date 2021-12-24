require("dotenv").config();
const MailService = require("./MailService");
const db = require("../models/database");
const fs = require("fs");
const axios = require("axios");
const billGenerator = require("./billGenerator");
const sequelize = require("sequelize");

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

const mailService = new MailService();

const Registrations = db.registrations;
const Children = db.newChildren;

const unlockTime = new Date(Date.parse("01 Jan 2022 11:59:50 UTC"));
const now = new Date().getTime();
const eta = unlockTime - now;

let unlocked = process.env.NODE_ENV === "dev";

if (process.env.UNLOCK === "true") {
  unlocked = true;
} else if (process.env.NODE_ENV === "prod") {
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
    resBoys: 20,
    resGirls: 20,
  },
  4: {
    resBoys: 16,
    resGirls: 24,
  },
  5: {
    resBoys: 20,
    resGirls: 20,
  },
};

const globalRegCount = {
  "1v": {},
  "2v": {},
  "3v": {},
  "4v": {},
  "5v": {},
};

const getBillNr = async () => {
  const previousBill = await Registrations.findOne({
    order: [["billNr", "DESC"]],
  });
  if (previousBill) {
    return previousBill.billNr + 1;
  }
  return 1;
};

const daysInMonth = (m, y) => {
  switch (m) {
    case 1:
      return y % 400 === 0 || (y % 4 === 0 && y % 100 === 0) ? 29 : 28;
    case 3:
    case 5:
    case 8:
    case 10:
      return 30;
    default:
      return 31;
  }
};

const validateDate = (d, m, y) => {
  m = parseInt(m, 10) - 1;
  if (m < 0 || m > 11) return false;
  return d > 0 && d <= daysInMonth(m, y);
};

const validateIdCode = (code) => {
  // The Estonian ID code consists of 11 characters.
  if (code.length !== 11) return false;

  // Years 2000 - 2099 start with 5 for boys, 6 for girls.
  const gender = parseInt(code.charAt(0));
  if (isNaN(gender) || gender < 5) return false;

  if (isNaN(parseInt(1, 7))) return false;
  const year = 2000 + parseInt(code.slice(1, 3));
  const month = parseInt(code.slice(3, 5));
  const day = parseInt(code.slice(5, 7));

  if (!validateDate(day, month, year)) return false;
  const birthday = new Date(year, month - 1, day);

  if (isNaN(parseInt(code.slice(7, 11)))) return false;

  return {
    birthday,
    gender: gender === 5 ? "M" : "F",
  };
};

const fetchChild = async (name) => {
  // Case-insensitive name search.
  const child = await Children.findOne({
    where: {
      name: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("name")),
        "LIKE",
        `%${name.toLowerCase()}%`
      ),
    },
  });

  return child ? child.id : null;
};

const addChild = async (name, gender) => {
  const child = await Children.create({ name, gender });
  if (!child) {
    console.log(child);
    console.log("Error creating child");
    return null;
  }
  const res = await Children.findOne({ where: { name } });
  if (!res) {
    console.log(res);
    console.log("Sanity check failed");
    return null;
  }
  return res.id;
};

const getData = async (src, i) => {
  let gender, birthday;

  const idCode = src.idCode[i];

  if (idCode) {
    const idData = validateIdCode(idCode);
    if (!idData) return false;
    gender = idData.gender;
    birthday = idData.birthday;
  } else {
    gender = src.gender[i];
    if (gender !== "M" && gender !== "F") return false;
    birthday = src.bDay[i];
  }

  const name = src.name[i];
  if (!name) return false;

  let childId = await fetchChild(name);
  if (!childId) {
    childId = await addChild(name, gender);
    if (!childId) {
      console.log("Error creating child");
      return false;
    }
  }

  const shiftNr = parseInt(src.shiftNr[i]);
  if (isNaN(shiftNr) || (shiftNr < 1 && shiftNr > 5)) return false;

  const isOld = src.isNew[i] !== "true";

  return {
    childId,
    shiftNr,
    idCode,
    birthday,
    isOld,
    tsSize: src.tsSize[i],
    addendum: src.addendum[i],
    road: src.road[i],
    city: src.city[i],
    county: src.county[i],
    country: src.country[i],
    contactName: src.contactName,
    contactNumber: src.contactNumber,
    contactEmail: src.contactEmail,
    backupTel: src.backupTel,
  };
};

const register = async (req, res) => {
  if (!unlocked) return res.status(409).send("Vara veel!");

  console.log(req.body);
  const childCount = parseInt(req.body.childCount);
  if (isNaN(childCount) || childCount < 1 || childCount > 4) return false;

  const childList = [];

  for (let i = 0; i < childCount; ++i) {
    let data;
    try {
      data = await getData(req.body, i);
    } catch (e) {
      console.error(e);
      return false;
    }
    if (!data) return false;
    childList.push(data);
  }

  console.log(childList);
};

exports.create = async (req, res) => {
  await register(req, res);
  return res.sendStatus(200);

  // Get the children.
  const childCount = parseInt(req.body["childCount"]);
  const campers = [];
  const errors = [];

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
      globalRegCount[shift][gender] = await Registrations.count({
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
      await Registrations.create(campers[i]);
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
