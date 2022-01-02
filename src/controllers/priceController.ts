import {Registration} from "../db/models/Registration";

require("dotenv").config();
import fs from "fs";

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

exports.updateAll = async (req, res) => {
  if (req.body["password"] !== process.env.BOSSPASS) {
    await res.status(403).end();
    return;
  }

  const children = await Registration.findAll();
  for (const child of children) {
    try {
      await child.update({
        priceToPay: calculatePrice(child),
      });
    } catch (err) {
      console.log(err);
    }
  }
  await res.status(200).end();
};

const calculatePrice = (child) => {
  let price = shiftData[child.shift].price;
  if (child.city.toLowerCase().trim() === "tallinn") price -= 20;
  else if (child.isOld) price -= 10;
  return price;
};
