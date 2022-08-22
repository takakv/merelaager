import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import { Registration } from "../db/models/Registration";
import { Child } from "../db/models/Child";
import { StatusCodes } from "http-status-codes";

const billGenerator = require("./billGenerator");

const bulkQueryByEmail = (contactEmail: string) => {
  return Registration.findAll({ where: { contactEmail }, include: Child });
};

const queryByEmail = (contactEmail: string) => {
  return Registration.findOne({
    where: { contactEmail },
    attributes: ["contactName", "billNr"],
  });
};

const getBillNr = async () => {
  const previousBill = await Registration.findOne({
    order: [["billNr", "DESC"]],
    attributes: ["billNr"],
  });
  if (previousBill) {
    return previousBill.billNr + 1;
  }
  return 21001;
};

export const create = async (req: Request, res: Response) => {
  const children = await bulkQueryByEmail(req.params["email"]);

  if (!children.length) {
    res.status(StatusCodes.NOT_FOUND).send("Pole sellist meiliaadressi.");
    return;
  }

  const campers: Registration[] = [];
  const names: string[] = [];
  let billNr = 0;

  children.forEach((child) => {
    if (billNr === 0 && child["billNr"]) billNr = child["billNr"];
    if (child["isRegistered"]) {
      campers.push(child);
      names.push(child.child.name);
    }
  });

  if (!billNr) {
    billNr = await getBillNr();
    await children.forEach((child) => {
      child.update({ billNr: billNr });
    });
  }
  if (campers.length) {
    const contact = {
      name: campers[0].contactName,
      email: campers[0].contactEmail,
    };

    const billName = await billGenerator.generatePDF(
      campers,
      names,
      contact,
      billNr,
      campers.length
    );

    res.sendFile(`${billName}`, {
      root: "./data/arved",
    });
  } else res.status(StatusCodes.NOT_FOUND).send("Pole registreeritud lapsi.");
};

export const fetch = async (req: Request, res: Response) => {
  const customer = await queryByEmail(req.params["email"]);
  if (!customer) {
    res.status(StatusCodes.NOT_FOUND).send("Pole sellist meiliaadressi");
    return;
  }

  const billName = billGenerator.getName(customer);
  const loc = `${path.join(__dirname, "../../")}data/arved/${billName}`;

  fs.access(loc, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(StatusCodes.NOT_FOUND).send("Puudub olemasolev arve");
    } else {
      res.sendFile(`${billName}`, {
        root: "./data/arved",
      });
    }
  });
};
