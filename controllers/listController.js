require("dotenv").config();
const db = require("../models/database");

const Campers = db.campers;

exports.generate = async (req, res) => {
  const shift = `${req.user.shift}v`;
  const isBoss = req.user.role === "boss";

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

  if (!isBoss) {
    returnData = {
      regBoys: [],
      regGirls: [],
      resBoys: [],
      resGirls: [],
    };
  } else {
    returnData = {
      1: {
        regBoys: [],
        regGirls: [],
        resBoys: [],
        resGirls: [],
      },
      2: {
        regBoys: [],
        regGirls: [],
        resBoys: [],
        resGirls: [],
      },
      3: {
        regBoys: [],
        regGirls: [],
        resBoys: [],
        resGirls: [],
      },
      4: {
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
      contactName: child["contactName"].trim(),
      contactEmail: child["contactEmail"],
      contactNr: child["contactNumber"],
      registered: child["isRegistered"] ? "jah" : "ei",
      tln: child["city"].toLowerCase().trim() === "tallinn" ? "jah" : "ei",
      pricePaid: child["pricePaid"],
      priceToPay: child["priceToPay"],
    };

    if (!isBoss) {
      setChild(data, returnData);
    } else {
      switch (child["shift"]) {
        case "1v":
          setChild(data, returnData[1]);
          break;
        case "2v":
          setChild(data, returnData[2]);
          break;
        case "3v":
          setChild(data, returnData[3]);
          break;
        case "4v":
          setChild(data, returnData[4]);
          break;
      }
    }
  });

  if (!isBoss) returnData = setCounts(returnData);
  else for (let i = 1; i <= 4; ++i) returnData[i] = setCounts(returnData[i]);

  return returnData;
};

const setCounts = (target) => {
  target.regBoyCount = target.regBoys.length;
  target.regGirlCount = target.regGirls.length;
  target.resBoyCount = target.resBoys.length;
  target.resGirlCount = target.resGirls.length;
  target.totalCount = target.regBoyCount + target.regGirlCount;
  return target;
};

const setChild = (data, target) => {
  if (data.registered === "jah") {
    if (data.gender === "Poiss") target.regBoys.push(data);
    else target.regGirls.push(data);
  } else {
    if (data.gender === "Poiss") target.resBoys.push(data);
    else target.resGirls.push(data);
  }
};

exports.update = async (req, res) => {
  const str = req.body.id;
  const breakpoint = str.indexOf("-");
  const id = str.substring(0, breakpoint);
  const action = str.substring(breakpoint + 1);
  const child = await Campers.findByPk(id);
  switch (action) {
    case "reg":
      await Campers.update(
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
      await Campers.update(
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
      await Campers.update(
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
      await Campers.update(
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
