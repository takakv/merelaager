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
const Children = process.env.TEST === db.child;

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

const prices = {
  1: 240,
  2: 320,
  3: 200,
  4: 320,
  5: 320,
};

const openSlots = {
  1: {
    M: 20,
    F: 20,
  },
  2: {
    M: 20,
    F: 20,
  },
  3: {
    M: 20,
    F: 20,
  },
  4: {
    M: 16,
    F: 24,
  },
  5: {
    M: 20,
    F: 20,
  },
};

const getBillNr = async () => {
  const previousBill = await Registrations.findOne({
    order: [["billNr", "DESC"]],
  });
  if (previousBill) {
    return previousBill.billNr + 1;
  }
  return 21001;
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

const registerOne = async (src, i, billNr) => {
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

  const regObj = {
    childId,
    shiftNr,
    idCode,
    birthday,
    isOld,
    isRegistered: false,
    tsSize: src.tsSize[i],
    addendum: src.addendum ? src.addendum[i] : null,
    road: src.road[i],
    city: src.city[i],
    county: src.county[i],
    country: src.country ? src.country[i] : "Eesti",
    contactName: src.contactName,
    contactNumber: src.contactNumber,
    contactEmail: src.contactEmail,
    backupTel: src.backupTel,
  };

  const regCount = await Registrations.count({
    where: {
      shiftNr,
      isRegistered: true,
    },
    include: {
      model: Children,
      where: { gender },
    },
  });

  if (regCount < openSlots[shiftNr][gender]) {
    regObj.isRegistered = true;
    regObj.billNr = billNr;
  }

  const [data, created] = await Registrations.findOrCreate({
    where: { childId, shiftNr },
    defaults: regObj,
  });

  return {
    ok: created,
    data: {
      isRegistered: created ? regObj.isRegistered : data.isRegistered,
      gender,
      name,
      isOld,
      shiftNr,
      message: created ? "" : "Laps on juba vahetuse nimekirjas",
    },
  };
};

const registerAll = async (req, res) => {
  if (!unlocked) return res.status(409).send("Vara veel!");

  console.log(req.body);
  const childCount = parseInt(req.body.childCount);
  if (isNaN(childCount) || childCount < 1) return false; // || childCount > 4) return false;

  const billNr = await getBillNr();

  let regCount = 0;
  const childList = [];
  const errorList = [];

  for (let i = 0; i < childCount; ++i) {
    let data;
    try {
      data = await registerOne(req.body, i, billNr);
    } catch (e) {
      console.error(e);
      return false;
    }

    if (data.ok) {
      childList.push(data.data);
      if (data.data.isRegistered) ++regCount;
    } else errorList.push(data.data);
  }

  // console.log("Registered the children");
  const price = calculatePrice(childList);
  const contact = {
    name: req.body.contactName,
    mail: req.body.contactEmail,
  };

  if (regCount) {
    // res.redirect("../edu/");
    res.sendStatus(200);
    // console.log("Start PDF generation");
    const billName = await billGenerator.generatePDF(
      childList,
      contact,
      billNr,
      regCount
    );
    // console.log("PDF generated");
    // console.log("Start sending mail");
    if (!req.body.noEmail)
      mailer(childList, contact, price, billName, regCount, billNr);
    else console.log("No email");
    // console.log("Mail sent");
  } else {
    res.sendStatus(200);
    // res.redirect("../reserv/");
    if (!req.body.noEmail) mailService.sendFailureMail(childList, contact);
    else console.log("No email");
  }
};

exports.create = async (req, res) => {
  await registerAll(req, res);
  // axios.post(process.env.URL, openSlots);
};

const mailer = (campers, contact, price, pdfName, regCount, billNr) => {
  mailService.sendConfirmationMail(
    campers,
    contact,
    price,
    pdfName,
    regCount,
    billNr
  );
};

const calculatePrice = (regList) => {
  let price = 0;
  regList.forEach((camper) => {
    if (!camper.isRegistered) return;
    price += prices[camper.shiftNr];
    if (camper.isOld) price -= 20;
  });
  return price;
};
