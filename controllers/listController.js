require("dotenv").config();
const db = require("../models/database");
const { generatePDF } = require("./listGenerator");
const { approveShift } = require("../routes/Support Files/shiftAuth");

const Registrations = db.registrations;
const Children = db.child;
const numberOfShifts = 5;

exports.fetch = async (req, res) => {
  const children = await Registrations.findAll({
    order: [["regOrder", "ASC"]],
    include: Children,
  });

  if (!children.length) return null;

  const { role } = req.user;
  const allowedRoles = ["op", "master", "boss", "root"];
  if (!allowedRoles.includes(role)) return null;

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
      name: child["child"]["name"],
      gender: child["child"]["gender"],
      bDay: child["birthday"],
      isOld: child["isOld"],
      shift: child["shiftNr"],
      tShirtSize: child["tsSize"],
      regOrder: child.regOrder,
      registered: child.isRegistered,
      // city: child["city"],
      // county: child["county"],
    };

    if (role !== "op") {
      data.billNr = child.billNr;
      data.contactName = child.contactName.trim();
      data.contactEmail = child.contactEmail.trim();
      data.contactNr = child.contactNumber.trim();
      data.pricePaid = child["pricePaid"];
      data.priceToPay = child["priceToPay"];
    }

    if (req.user.role === "root") data.idCode = child.idCode;

    pushData(data, returnData[child.shiftNr]);
  });

  return returnData;
};

const pushData = (camper, target) => {
  target.campers[camper.id] = camper;
  if (camper.registered) {
    if (camper.gender === "M") target.regBoyCount++;
    else target.regGirlCount++;
    target.totalRegCount++;
  } else {
    if (camper.gender === "M") target.resBoyCount++;
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
      await Registrations.update(
        { isRegistered: !camper.isRegistered },
        { where: { id } }
      );
      return true;
    // Toggle whether or not the camper has been to the camp before.
    case "regular":
      await Registrations.update({ isOld: !camper.isOld }, { where: { id } });
      return true;
  }

  if (req.user.role !== "root") {
    console.log("User not authorised for price manipulation.");
    return res.sendStatus(404) && null;
  }

  const value = req.params.value;

  switch (action) {
    // Update the amount that has been paid for the camper.
    case "total-paid":
      await Registrations.update({ pricePaid: value }, { where: { id } });
      break;
    // Update the total amount due fo the camper.
    case "total-due":
      await Registrations.update({ priceToPay: value }, { where: { id } });
      break;
    default:
      res.sendStatus(400);
      return null;
  }
  return true;
};

const getCamper = async (id, queryUser) => {
  const camper = await Registrations.findByPk(id);
  if (!camper)
    return {
      code: 404,
      message: "Camper not found",
      ok: false,
    };

  // Evaluate access rights.
  const shift = parseInt(camper.shiftNr);
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
    code: 200,
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

  await Registrations.destroy({ where: { id } });
  return true;
};

exports.print = async (shiftNr) => {
  const children = await Registrations.findAll({
    where: { shiftNr, isRegistered: true },
    include: {
      model: Children,
      order: [["name", "ASC"]],
    },
  });

  if (!children.length) return null;

  let childrenInfo = [];

  children.forEach((child) => {
    childrenInfo.push({
      name: child.child.name,
      gender: child.child.gender,
      birthday: child.birthday,
      isOld: child.isOld,
      tsSize: child.tsSize,
      contactName: child.contactName.trim(),
      contactEmail: child.contactEmail.trim(),
      contactNr: child.contactNumber.trim(),
    });
  });

  return generatePDF(shiftNr, childrenInfo);
};
