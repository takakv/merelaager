require("dotenv").config();
const db = require("../models/database");

const Campers = db.campers;
const shifts = [1, 2, 3, 4];
const numberOfShifts = 4;

exports.fetch = async (req, res) => {
  /*if (
                                                  !req.body.hasOwnProperty("shift") ||
                                                  !shifts.includes(parseInt(req.body.shift))
                                                ) {
                                                  res.status(400).end();
                                                  return null;
                                                }
                                                const shift = `${req.body.shift}v`;
                                                 */
  const isBoss = true; //req.user.role === "boss";

  let children;
  if (!isBoss) {
    children = await Campers.findAll({
      where: {
        shift: shift,
      },
      order: [["id", "ASC"]],
    });
  } else {
    children = await Campers.findAll({
      order: [["id", "ASC"]],
    });
  }

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
      idCode: child["idCode"],
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
    target.resGirlCount++;
  }
};

exports.update = async (req, res) => {
  // Entry ID and field to update.
  if (!req.params.userId || !req.params.field) {
    res.sendStatus(400);
    return null;
  }
  const id = req.params.userId;
  const action = req.params.field;

  // Entry value, if needed.
  if (
    (action === "total-paid" || action === "total-due") &&
    !req.params.value
  ) {
    res.sendStatus(400);
    return null;
  }
  const value = req.params.value;
  // Fetch user.
  const child = await Campers.findByPk(id);
  if (!child) {
    res.sendStatus(404);
    return null;
  }

  switch (action) {
    // Toggle the camper registration status.
    case "registration":
      await Campers.update(
        {
          isRegistered: !child.isRegistered,
        },
        {
          where: { id },
        }
      );
      break;
    // Update the amount that has been paid for the camper.
    case "total-paid":
      await Campers.update(
        {
          pricePaid: value,
        },
        {
          where: { id },
        }
      );
      break;
    // Update the total amount due fo the camper.
    case "total-due":
      await Campers.update(
        {
          priceToPay: value,
        },
        {
          where: { id },
        }
      );
      break;
    // Toggle whether or not the camper has been to the camp before.
    case "regular":
      await Campers.update(
        {
          isOld: !child.isOld,
        },
        {
          where: { id },
        }
      );
      break;
    default:
      res.sendStatus(400);
      return null;
  }
  return true;
};
