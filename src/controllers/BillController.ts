import path from "path";
import fs from "fs";

import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { Registration } from "../db/models/Registration";
import { Child } from "../db/models/Child";
import BillBuilder from "./billGenerator";
import HttpError from "../routes/Support Files/Errors/HttpError";

class BillController {
  private static bulkQueryByEmail = async (contactEmail: string) => {
    return Registration.findAll({ where: { contactEmail }, include: Child });
  };

  private static queryByEmail = async (contactEmail: string) => {
    return Registration.findOne({
      where: { contactEmail },
      attributes: ["contactName", "billNr"],
    });
  };

  private static getBillNr = async () => {
    const previousBill = await Registration.findOne({
      order: [["billNr", "DESC"]],
      attributes: ["billNr"],
    });
    if (previousBill) {
      return previousBill.billNr + 1;
    }
    return 0;
  };

  public static createBill = async (req: Request, res: Response) => {
    const children = await this.bulkQueryByEmail(req.params.email);

    if (!children.length) {
      const err = new HttpError(StatusCodes.NOT_FOUND, "Unknown email address");
      res.status(err.httpCode).json(err.json());
      return;
    }

    const campers: Registration[] = [];
    let billNr: number;

    children.forEach((child: Registration) => {
      if (billNr === 0 && child.billNr) billNr = child.billNr;
      if (child.isRegistered) campers.push(child);
    });

    if (!billNr) {
      billNr = await this.getBillNr();
      if (!billNr) {
        const err = new HttpError(
          StatusCodes.NOT_FOUND,
          "No previous bill number found"
        );
        res.status(err.httpCode).json(err.json());
        return;
      }
      for (const child of children) {
        await child.update({ billNr });
      }
    }
    if (campers.length) {
      const contact = {
        name: campers[0].contactName,
        email: campers[0].contactEmail,
      };

      const billName = await BillBuilder.generatePdf(
        campers,
        contact,
        billNr,
        campers.length
      );

      res.sendFile(`${billName}`, {
        root: "./data/arved",
      });
      return;
    }

    const err = new HttpError(
      StatusCodes.NOT_FOUND,
      "No registered children associated with the email address"
    );
    res.status(err.httpCode).json(err.json());
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
