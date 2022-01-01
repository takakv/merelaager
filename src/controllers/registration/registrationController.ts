require("dotenv").config();
const MailService = require("../MailService");

const axios = require("axios");
const billGenerator = require("../billGenerator");
const sequelize = require("sequelize");

const meta = require("./meta");

const mailService = new MailService();

const DEBUG = false;

import Registration from "../../db/models/registration";
import Child from "../../db/models/child";

let unlocked = process.env.NODE_ENV === "dev";

if (process.env.UNLOCK === "true") {
  unlocked = true;
} else if (process.env.NODE_ENV === "prod") {
  setTimeout(() => {
    unlocked = true;
  }, meta.eta);
}

console.log(`Registration is unlocked? ${unlocked}`);
console.log(
  `Unlock date: ${meta.unlockTime.toLocaleString("en-GB", {
    timeZone: "Europe/Tallinn",
  })} (Estonian time)`
);
console.log(`Unlock delta: ${meta.eta}`);

const availableSlots = {
  1: { M: 0, F: 0 },
  2: { M: 0, F: 0 },
  3: { M: 0, F: 0 },
  4: { M: 0, F: 0 },
  5: { M: 0, F: 0 },
};

let billNumber = 0;
let registrationOrder = 1;
let slotsReady = false;
let billReady = false;
let ready = false;

const fetchPromises = () => {
  const promises = [];

  for (let i = 1; i <= 5; ++i) {
    promises.push(
      Registration.count({
        where: { isRegistered: true, shiftNr: i },
        include: { model: Child, where: { gender: "M" } },
      })
    );
    promises.push(
      Registration.count({
        where: { isRegistered: true, shiftNr: i },
        include: { model: Child, where: { gender: "F" } },
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
  const previousBill = await Registration.findOne({
    order: [["billNr", "DESC"]],
  });
  if (previousBill) {
    billNumber = previousBill.billNr + 1;
  } else billNumber = 21001;
};

const initializeRegistrationOrder = async () => {
  const prevReg = await Registration.findOne({
    order: [["regOrder", "DESC"]],
    attributes: ["regOrder"],
  });
  if (prevReg) registrationOrder = prevReg.regOrder + 1;
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

initializeRegistrationOrder().then(() => {
  console.log(`Reg order: ${registrationOrder}`);
});

const parser = require("./parser");

const fetchChild = async (name) => {
  // Case-insensitive name search.
  const child = await Child.findOne({
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
  const child = await Child.create({ name, gender });
  if (!child) {
    console.log(child);
    console.log("Error creating child");
    return null;
  }
  const res = await Child.findOne({ where: { name } });
  if (!res) {
    console.log(res);
    console.log("Sanity check failed");
    return null;
  }
  return res.id;
};

const getGenders = (idCodeArray) => {
  const genders = [];
  idCodeArray.forEach((idCode) => {
    genders.push(idCode[0] === "5" ? "M" : "F");
  });
  return genders;
};

const postChildren = async (names, genders) => {
  const childIds = [];
  for (let i = 0; i < names.length; ++i) {
    let childId = await fetchChild(names[i]);
    if (!childId) {
      childId = await addChild(names[i], genders[i]);
      if (!childId) return null;
    }
    childIds.push(childId);
  }
  return childIds;
};

const getChildData = (
  rawData,
  childIds,
  registrations,
  shiftNrs,
  i,
  billNr,
  regOrder
) => {
  let birthday;
  const idCode = rawData.idCode[i];

  if (idCode) {
    birthday = parser.validateIdCode(idCode).birthday;
  } else {
    birthday = rawData.bDay[i];
  }

  const isOld = rawData[`newAtCamp-${i + 1}`] !== "true";

  const isRegistered = registrations[i];
  const shiftNr = parseInt(shiftNrs[i].trim());

  return {
    idCode,
    birthday,
    isOld,
    billNr: isRegistered ? billNr : null,
    shiftNr,
    childId: childIds[i],
    isRegistered,
    regOrder,
    priceToPay: getPrice(shiftNr, isOld),
    tsSize: rawData.tsSize[i],
    addendum: rawData.addendum ? rawData.addendum[i] : null,
    road: rawData.road[i],
    city: rawData.city[i],
    county: rawData.county[i],
    country: rawData.country ? rawData.country[i] : "Eesti",
    contactName: rawData.contactName,
    contactEmail: rawData.contactEmail,
    contactNumber: rawData.contactNumber,
    backupTel: rawData.backupTel,
  };
};

const prepRawData = (rawData) => {
  rawData.idCode = [rawData.idCode];
  rawData.isNew = [rawData.isNew];
  rawData.tsSize = [rawData.tsSize];
  rawData.addendum = [rawData.addendum];
  rawData.road = [rawData.road];
  rawData.city = [rawData.city];
  rawData.county = [rawData.county];
  rawData.country = [rawData.country];
  return rawData;
};

const getChildrenData = (
  childCount,
  rawData,
  childIds,
  registrations,
  shiftNrs,
  billNr,
  regOrder
) => {
  if (childCount === 1 && !Array.isArray(rawData.tsSize))
    rawData = prepRawData(rawData);
  const childrenData = [];
  for (let i = 0; i < childCount; ++i) {
    try {
      childrenData.push(
        getChildData(
          rawData,
          childIds,
          registrations,
          shiftNrs,
          i,
          billNr,
          regOrder
        )
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  return childrenData;
};

const registerAll = async (req, res) => {
  if (!unlocked) return res.status(409).send("Vara veel!");

  const childCount = parseInt(req.body.childCount);
  if (isNaN(childCount) || childCount < 1 || childCount > 4) return false;

  const order = registrationOrder++;
  console.log(`Registration: ${order} at ${Date.now()}`);

  let shiftNrs, genders, names;

  // Determine how many children need to be registered,
  // their gender and desired shift to lock the slots.

  // First determine genders, shifts, and names.
  // Names will be needed later.
  if (Array.isArray(req.body.shiftNr)) {
    shiftNrs = req.body.shiftNr;
    genders = getGenders(req.body.idCode);
    names = req.body.name;
  } else {
    shiftNrs = [req.body.shiftNr];
    genders = getGenders([req.body.idCode]);
    names = [req.body.name];
  }

  if (DEBUG) {
    console.log(`Shifts: ${shiftNrs}`);
    console.log(`Genders: ${genders}`);
  }

  // Sanity check.
  if (shiftNrs.length !== genders.length || shiftNrs.length !== names.length)
    return false;

  // Immediately lock the available slots,
  // store whether there was room or not.
  const isRegistered = [];
  let regCount = 0;
  for (let i = 0; i < childCount; ++i) {
    if (availableSlots[shiftNrs[i]][genders[i]] > 0) {
      isRegistered.push(true);
      ++regCount;
      --availableSlots[shiftNrs[i]][genders[i]];
    } else isRegistered.push(false);
  }

  axios.post(process.env.URL, availableSlots).catch();

  // Keep track of registration bill order.
  const billNr = regCount ? billNumber++ : null;

  if (DEBUG) console.log(`RegStatus: ${isRegistered}`);

  // Commit children into the database.
  const childIds = await postChildren(names, genders);

  if (DEBUG) console.log(`ChildIds: ${childIds}`);

  // Fetch data regarding the children.
  const childrenData = getChildrenData(
    childCount,
    req.body,
    childIds,
    isRegistered,
    shiftNrs,
    billNr,
    order
  );

  if (!childrenData) return res.sendStatus(400);

  if (DEBUG) {
    console.log("ChildrenData:");
    console.log(childrenData);
  }

  await Registration.bulkCreate(childrenData);

  const contact = {
    name: childrenData[0].contactName,
    email: childrenData[0].contactEmail,
  };

  if (regCount) {
    // res.sendStatus(200);
    res.redirect("../edu/");
    const billName = await billGenerator.generatePDF(
      childrenData,
      names,
      contact,
      billNr,
      regCount
    );

    // console.log("PDF generated");
    if (req.body.noEmail) return;

    try {
      await mailer(childrenData, names, contact, billName, regCount, billNr);
    } catch (e) {
      console.error(e);
    }
  } else {
    // res.sendStatus(200);
    res.redirect("../reserv/");
    if (req.body.noEmail) return;
    try {
      await mailService.sendFailureMail(childrenData, contact);
    } catch (e) {
      console.error(e);
    }
  }
};

exports.create = async (req, res) => {
  try {
    await registerAll(req, res);
  } catch (e) {
    console.error(e);
  }
};

const mailer = async (campers, names, contact, pdfName, regCount, billNr) => {
  return mailService.sendConfirmationMail(
    campers,
    names,
    contact,
    calculatePrice(campers),
    pdfName,
    regCount,
    billNr
  );
};

const getPrice = (shiftNr, isOld) => {
  let price = meta.prices[shiftNr];
  if (isOld) price -= 20;
  return price;
};

const calculatePrice = (regList) => {
  let price = 0;
  regList.forEach((camper) => {
    if (!camper.isRegistered) return;
    price += getPrice(camper.shiftNr, camper.isOld);
  });
  return price;
};
