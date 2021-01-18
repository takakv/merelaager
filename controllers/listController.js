require("dotenv").config();
const db = require("../models/database");

const Camper = db.campers;

exports.generate = async (req, res) => {
  const shift = `${req.user.shift}v`;
  let children;
  if (shift !== "2v")
    children = await Camper.findAll({
      where: {
        shift: shift,
      },
      order: [
        ["shift", "ASC"],
        ["id", "ASC"],
      ],
    });
  else {
    children = await Camper.findAll({
      order: [
        ["shift", "ASC"],
        ["id", "ASC"],
      ],
    });
  }

  let returnData = {};
  if (shift !== "2v") {
    returnData = {
      regBoys: [],
      regGirls: [],
      resBoys: [],
      resGirls: [],
    };
  } else {
    returnData = {
      "1v": {
        regBoys: [],
        regGirls: [],
        resBoys: [],
        resGirls: [],
      },
      "2v": {
        regBoys: [],
        regGirls: [],
        resBoys: [],
        resGirls: [],
      },
      "3v": {
        regBoys: [],
        regGirls: [],
        resBoys: [],
        resGirls: [],
      },
      "4v": {
        regBoys: [],
        regGirls: [],
        resBoys: [],
        resGirls: [],
      },
    };
  }

  children.forEach((child) => {
    const data = {
      id: child["id"],
      name: child["name"],
      idCode: child["idCode"],
      gender: child["gender"],
      bDay: child["birthday"],
      isOld: child["isOld"] ? "jah" : "ei",
      shift: child["shift"],
      tShirtSize: child["tsSize"],
      city: child["city"],
      county: child["county"],
      billNr: child["billNr"],
      contact: `${child["contactName"]}, ${child["contactEmail"]}, ${child["contactNumber"]}`,
      registered: child["isRegistered"] ? "jah" : "ei",
      pricePaid: child["pricePaid"],
      priceToPay: child["priceToPay"],
    };
    if (child["isRegistered"]) {
      if (shift !== "2v") {
        if (child["gender"] === "Poiss") {
          returnData.regBoys.push(data);
        } else {
          returnData.regGirls.push(data);
        }
      } else {
        if (child["gender"] === "Poiss") {
          returnData[child["shift"]].regBoys.push(data);
        } else {
          returnData[child["shift"]].regGirls.push(data);
        }
      }
    } else {
      if (shift !== "2v") {
        if (child["gender"] === "Poiss") {
          returnData.resBoys.push(data);
        } else {
          returnData.resGirls.push(data);
        }
      } else {
        if (child["gender"] === "Poiss") {
          returnData[child["shift"]].resBoys.push(data);
        } else {
          returnData[child["shift"]].resGirls.push(data);
        }
      }
    }
  });
  if (shift !== "2v") {
    returnData.totalCount =
      returnData.regBoys.length + returnData.regGirls.length;
    returnData.boyCount = returnData.regBoys.length;
    returnData.girlCount = returnData.regGirls.length;
    returnData.resGirlsCount = returnData.resGirls.length;
    returnData.resBoysCount = returnData.resBoys.length;
  }
  return returnData;
};

exports.update = async (req, res) => {
  const str = req.body.id;
  const breakpoint = str.indexOf("-");
  const id = str.substring(0, breakpoint);
  const action = str.substring(breakpoint + 1);
  const child = await Camper.findByPk(id);
  switch (action) {
    case "reg":
      await Camper.update(
        {
          isRegistered: !child.isRegistered,
        },
        {
          where: {
            id: id,
          },
        }
      );
      break;
    case "paid":
      await Camper.update(
        {
          pricePaid: req.body.value,
        },
        {
          where: {
            id: id,
          },
        }
      );
      break;
    case "toPay":
      await Camper.update(
        {
          priceToPay: req.body.value,
        },
        {
          where: {
            id: id,
          },
        }
      );
      break;
    case "old":
      await Camper.update(
        {
          isOld: !child.isOld,
        },
        {
          where: {
            id: id,
          },
        }
      );
      break;
  }
  return true;
};
