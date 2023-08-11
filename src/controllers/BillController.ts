import path from "path";
import fs from "fs";

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { Registration } from "../db/models/Registration";
import { Child } from "../db/models/Child";
import BillBuilder from "./billGenerator";
import HttpError from "../routes/Support Files/Errors/HttpError";
import { Bill } from "../db/models/Bill";

class BillController {
  private static bulkQueryByEmail = async (contactEmail: string) => {
    return Registration.findAll({ where: { contactEmail }, include: Child });
  };

  private static queryByEmail = async (contactEmail: string) => {
    return Registration.findOne({
      where: { contactEmail },
      attributes: ["contactName", "billId"],
    });
  };

  public static createBill = async (req: Request, res: Response) => {
    const registrations = await this.bulkQueryByEmail(req.params.email);

    if (!registrations.length) {
      const err = new HttpError(StatusCodes.NOT_FOUND, "Unknown email address");
      res.status(err.httpCode).json(err.json());
      return;
    }

    const registeredCampers: Registration[] = [];
    let billTotal = 0;
    let billNr: number;

    registrations.forEach((child: Registration) => {
      if (!billNr && child.billId) billNr = child.billId;
      if (child.isRegistered) {
        registeredCampers.push(child);
        billTotal += child.priceToPay;
      }
    });

    if (!registeredCampers.length) {
      const err = new HttpError(
        StatusCodes.NOT_FOUND,
        "No registered children associated with the email address"
      );
      res.status(err.httpCode).json(err.json());
    }

    const contact = {
      name: registeredCampers[0].contactName,
      email: registeredCampers[0].contactEmail,
    };

    if (!billNr) {
      const newBill = await Bill.create({
        contactName: contact.name,
        billTotal,
      });
      billNr = newBill.id;

      for (const registration of registrations) {
        await registration.update({ billId: billNr });
      }
    }

    const billName = await BillBuilder.generatePdf(
      registeredCampers,
      contact,
      billNr,
      registeredCampers.length
    );

    res.sendFile(`${billName}`, {
      root: "./data/arved",
    });
  };

  public static fetchBill = async (req: Request, res: Response) => {
    const customer = await this.queryByEmail(req.params.email);

    if (!customer) {
      const err = new HttpError(StatusCodes.NOT_FOUND, "Unknown email address");
      res.status(err.httpCode).json(err.json());
      return;
    }

    const billName = BillBuilder.getName(customer);
    const loc = `${path.join(__dirname, "../../")}data/arved/${billName}`;

    fs.access(loc, fs.constants.F_OK, (accessError) => {
      if (accessError) {
        const err = new HttpError(
          StatusCodes.NOT_FOUND,
          "No existing bill found"
        );
        res.status(err.httpCode).json(err.json());
        return;
      }

      res.sendFile(`${billName}`, {
        root: "./data/arved",
      });
    });
  };
}

export default BillController;
