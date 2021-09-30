require("dotenv").config();
const db = require("../models/database");
const { generatePDF } = require("./listGenerator");
const { approveShift } = require("../routes/Support Files/shiftAuth");

const Campers = db.campers;
const numberOfShifts = 4;

exports.fetch = async (req, res) => {
  const children = await Campers.findAll({
    order: [["id", "ASC"]],
  });

  if (!children.length) return res.sendStatus(404) && null;

  let returnData = {};

  for (let i = 1; i <= numberOfShifts; ++i) {
    returnData[i] = {
      campers: {},
      regBoyCount: 0,
      regGirlCount: 0,
      resBoyCount: 0,
      resGirlCount: 0,
      totalRegCount: 0,
    };
  }

  children.forEach((child) => {
    const data = {
      id: child["id"],
      name: child["name"],
      gender: child["gender"],
      bDay: child["birthday"],
      isOld: child["isOld"],
      shift: child["shift"],
      tShirtSize: child["tsSize"],
      // city: child["city"],
      // county: child["county"],
      billNr: child["billNr"],
      contactName: child["contactName"].trim(),
      contactEmail: child["contactEmail"],
      contactNr: child["contactNumber"],
      registered: child["isRegistered"],
      tln: child["city"].toLowerCase().trim() === "tallinn",
      pricePaid: child["pricePaid"],
      priceToPay: child["priceToPay"],
    };

    if (req.user.role === "boss") data.idCode = child.idCode;

    switch (child["shift"]) {
      case "1v":
        pushData(data, returnData[1]);
        break;
      case "2v":
        pushData(data, returnData[2]);
        break;
      case "3v":
        pushData(data, returnData[3]);
        break;
      case "4v":
        pushData(data, returnData[4]);
        break;
    }
  });

  return returnData;
};

const pushData = (camper, target) => {
  target.campers[camper.id] = camper;
  if (camper.registered) {
    if (camper.gender === "Poiss") target.regBoyCount++;
    else target.regGirlCount++;
    target.totalRegCount++;
  } else {
    if (camper.gender === "Poiss") target.resBoyCount++;
    else target.resGirlCount++;
  }
};

exports.update = async (req, res) => {
  // Entry ID and field to update.
  if (!req.params.userId || !req.params.field)
    return res.sendStatus(400) && null;

  const id = req.params.userId;
  const action = req.params.field;

  // Entry value, if needed.
  if ((action === "total-paid" || action === "total-due") && !req.params.value)
    return res.sendStatus(400) && null;

  const camper = await getCamper(id, req.user);
  if (!camper.ok) return res.sendStatus(camper.code) && null;

  switch (action) {
    // Toggle the camper registration status.
    case "registration":
      await Campers.update(
        { isRegistered: !camper.isRegistered },
        { where: { id } }
      );
      return true;
    // Toggle whether or not the camper has been to the camp before.
    case "regular":
      await Campers.update({ isOld: !camper.isOld }, { where: { id } });
      return true;
  }

  if (req.user.role !== "boss") {
    console.log("User not authorised for price manipulation.");
    return res.sendStatus(404) && null;
  }

  const value = req.params.value;

  switch (action) {
    // Update the amount that has been paid for the camper.
    case "total-paid":
      await Campers.update({ pricePaid: value }, { where: { id } });
      break;
    // Update the total amount due fo the camper.
    case "total-due":
      await Campers.update({ priceToPay: value }, { where: { id } });
      break;
    default:
      res.sendStatus(400);
      return null;
  }
  return true;
};

const getCamper = async (id, queryUser) => {
  const camper = await Campers.findByPk(id);
  if (!camper)
    return {
      code: 404,
      message: "Camper not found",
      ok: false,
    };

  // Evaluate access rights.
  const shift = parseInt(camper.shift[0]);
  if (!(await approveShift(queryUser, shift))) {
    const message = "User not authorised for the shift";
    console.log(message);
    return {
      code: 403,
      message,
      ok: false,
    };
  }

  return {
    code: 400,
    message: "",
    ok: true,
    data: camper,
  };
};

exports.remove = async (req, res) => {
  // Entry ID check.
  if (!req.params.userId) return res.sendStatus(400) && null;

  const id = req.params.userId;
  const camper = await getCamper(id, req.user);
  if (!camper.ok) return res.sendStatus(camper.code) && null;

  await Campers.destroy({ where: { id } });
  return true;
};

exports.print = async (shiftNr) => {
  const children = await Campers.findAll({
    order: [["name", "ASC"]],
    where: {
      shift: `${shiftNr}v`,
      isRegistered: true,
    },
  });

  if (!children.length) return null;

  let childrenInfo = [];

  children.forEach((child) => {
    childrenInfo.push({
      name: child.name,
      gender: child.gender,
      birthday: child.birthday,
      isOld: child.isOld,
      tsSize: child.tsSize,
      contactName: child.contactName.trim(),
      contactEmail: child.contactEmail,
      contactNr: child.contactNumber,
    });
  });

  return generatePDF(shiftNr, childrenInfo);
};
