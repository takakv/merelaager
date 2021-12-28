require("dotenv").config();
const MailService = require("../MailService");
const db = require("../../models/database");
const axios = require("axios");
const billGenerator = require("../billGenerator");
const sequelize = require("sequelize");

const meta = require("./meta");

const mailService = new MailService();

const DEBUG = false;

const Registrations = db.registrations;
const Children = db.child;

let unlocked = process.env.NODE_ENV === "dev";

if (process.env.UNLOCK === "true") {
  unlocked = true;
} else if (process.env.NODE_ENV === "prod") {
  setTimeout(() => {
    unlocked = true;
  }, meta.eta);
}

const availableSlots = {
  1: { M: 0, F: 0 },
  2: { M: 0, F: 0 },
  3: { M: 0, F: 0 },
  4: { M: 0, F: 0 },
  5: { M: 0, F: 0 },
};

let billNumber = 0;
let slotsReady = false;
let billReady = false;
let ready = false;

const fetchPromises = () => {
  const promises = [];

  for (let i = 1; i <= 5; ++i) {
    promises.push(
      Registrations.count({
        where: { isRegistered: true, shiftNr: i },
        include: { model: Children, where: { gender: "M" } },
      })
    );
    promises.push(
      Registrations.count({
        where: { isRegistered: true, shiftNr: i },
        include: { model: Children, where: { gender: "F" } },
      })
    );
  }

  return promises;
};

const initializeAvailableSlots = async () => {
  const regCounts = await Promise.all(fetchPromises());
  for (let i = 1, j = 0; i <= 5; ++i) {
    availableSlots[i].M = meta.openSlots[i].M - regCounts[j++];
    availableSlots[i].F = meta.openSlots[i].F - regCounts[j++];
  }
};

const initializeBillNr = async () => {
  const previousBill = await Registrations.findOne({
    order: [["billNr", "DESC"]],
  });
  if (previousBill) {
    billNumber = previousBill.billNr + 1;
  } else billNumber = 21001;
};

initializeAvailableSlots().then(() => {
  console.log("Available slots:");
  console.log(availableSlots);
  slotsReady = true;
  if (billReady) ready = true;
});

initializeBillNr().then(() => {
  console.log(`First bill: ${billNumber}`);
  billReady = true;
  if (slotsReady) ready = true;
});

const getBillNr = async () => {
  /*
  const previousBill = await Registrations.findOne({
    order: [["billNr", "DESC"]],
  });
  if (previousBill) {
    return previousBill.billNr + 1;
  }
  */
  if (billNumber === 0) await initializeBillNr();
  return billNumber;
};

const parser = require("./parser");

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

const registerOne = async (regObj, billNr) => {
  const { shiftNr, gender, isOld, name } = regObj;

  /*
  let childId = await fetchChild(name);
  if (!childId) {
    childId = await addChild(name, gender);
    if (!childId) {
      console.log("Error creating child");
      return false;
    }
  }
  */

  /*
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
  */

  const regCount = availableSlots[shiftNr][gender];

  if (regCount > 0) {
    --availableSlots[shiftNr][gender];
    regObj.isRegistered = true;
    regObj.billNr = billNr;
  }

  let childId = await fetchChild(name);
  if (!childId) {
    childId = await addChild(name, gender);
    if (!childId) {
      console.log("Error creating child");
      return false;
    }
  }

  regObj.childId = childId;
  delete regObj.name;
  delete regObj.gender;

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

const prepChild = (data, i) => {
  let gender, birthday;

  const idCode = data.idCode[i];

  if (idCode) {
    const idData = parser.validateIdCode(idCode);
    if (!idData) return false;
    gender = idData.gender;
    birthday = idData.birthday;
  } else {
    gender = data.gender[i];
    if (gender !== "M" && gender !== "F") return false;
    birthday = data.bDay[i];
  }

  const name = data.name[i];
  if (!name) return false;

  const shiftNr = parseInt(data.shiftNr[i]);
  if (isNaN(shiftNr) || (shiftNr < 1 && shiftNr > 5)) return false;

  const isOld = data.isNew[i] !== "true";

  const regObj = {
    shiftNr,
    name,
    idCode,
    gender,
    birthday,
    isOld,
    isRegistered: false,
    tsSize: data.tsSize[i],
    addendum: data.addendum ? data.addendum[i] : null,
    road: data.road[i],
    city: data.city[i],
    county: data.county[i],
    country: data.country ? data.country[i] : "Eesti",
  };

  return regObj;
};

// This is only for API testing.
// There will always be arrays from the website.
const prepSingle = (data) => {
  let gender, birthday;

  const idCode = data.idCode;

  if (idCode) {
    const idData = parser.validateIdCode(idCode);
    if (!idData) return false;
    gender = idData.gender;
    birthday = idData.birthday;
  } else {
    gender = data.gender;
    if (gender !== "M" && gender !== "F") return false;
    birthday = data.bDay;
  }

  const name = data.name;
  if (!name) return false;

  const shiftNr = parseInt(data.shiftNr);
  if (isNaN(shiftNr) || (shiftNr < 1 && shiftNr > 5)) return false;

  const isOld = data.isNew !== "true";

  const regObj = {
    shiftNr,
    name,
    idCode,
    gender,
    birthday,
    isOld,
    isRegistered: false,
    tsSize: data.tsSize,
    addendum: data.addendum ? data.addendum : null,
    road: data.road,
    city: data.city,
    county: data.county,
    country: data.country ? data.country : "Eesti",
  };

  return regObj;
};

const prepareAllChildren = async (data, childCount) => {
  const childList = [];
  const errorList = [];

  const billNr = billNumber++;
  let regCount = 0;

  for (let i = 0; i < childCount; ++i) {
    let res;
    let regObj = childCount > 1 ? prepChild(data, i) : prepSingle(data);

    regObj.contactName = data.contactName;
    regObj.contactEmail = data.contactEmail;
    regObj.contactNumber = data.contactNumber;
    regObj.backupTel = data.backupTel;

    try {
      res = await registerOne(regObj, billNr);
      // const temp = preRegister(req.body, i);
      // console.log(temp);
    } catch (e) {
      console.error(e);
      return false;
    }

    if (res.ok) {
      childList.push(res.data);
      if (res.data.isRegistered) ++regCount;
    } else errorList.push(res.data);
  }

  return {
    childList,
    errorList,
    regCount,
  };
};

const registerAll = async (req, res) => {
  if (!unlocked) return res.status(409).send("Vara veel!");

  const childCount = parseInt(req.body.childCount);
  if (isNaN(childCount) || childCount < 1 || childCount > 4) return false;

  let seed;

  if (DEBUG) {
    seed = Math.random();
    console.log(`${seed}: Attempting to register ${childCount} children`);
  }

  // const billNr = await getBillNr();
  // ++billNumber;
  const billNr = billNumber;

  const { childList, errorList, regCount } = await prepareAllChildren(
    req.body,
    childCount
  );

  if (DEBUG) console.log(`${seed}: Registered ${regCount} children`);

  const price = calculatePrice(childList);
  const contact = {
    name: req.body.contactName,
    mail: req.body.contactEmail,
  };

  if (DEBUG) {
    console.log(`${seed}: Available slots:`);
    console.log(availableSlots);
  }

  if (regCount) {
    // res.redirect("../edu/");
    // console.log("Start PDF generation");
    const billName = await billGenerator.generatePDF(
      childList,
      contact,
      billNr,
      regCount
    );
    res.sendStatus(200);
    // console.log("PDF generated");
    if (!req.body.noEmail)
      mailer(childList, contact, price, billName, regCount, billNr);
  } else {
    res.sendStatus(200);
    // res.redirect("../reserv/");
    if (!req.body.noEmail) mailService.sendFailureMail(childList, contact);
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
    price += meta.prices[camper.shiftNr];
    if (camper.isOld) price -= 20;
  });
  return price;
};
