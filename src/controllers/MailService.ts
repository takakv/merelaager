import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import nodemailer, { Transporter } from "nodemailer";
import EmailBuilder from "./mailService/boilerplate";
import { Registration } from "../db/models/Registration";
import type { EmailReceiptInfo } from "./registrations/registration.types";

dotenv.config();

const mg = require("nodemailer-mailgun-transport");

export type contact = {
  name: string;
  email: string;
};

class MailService {
  private _transporter: Transporter;

  constructor() {
    const config = {
      auth: {
        api_key: process.env.EMAIL_API,
        domain: process.env.EMAIL_SERV,
      },
      host: "api.eu.mailgun.net",
    };

    this._transporter = nodemailer.createTransport(mg(config));
  }

  public sendConfirmationMail(
    contact: contact,
    regCampers: Registration[],
    resCampers: Registration[],
    shifts: number[],
    totalPrice: number,
    billName: string,
    billNr: number,
  ) {
    const pdfPath = path.resolve(
      path.join(__dirname, "../../data/arved", billName),
    );
    return this._transporter.sendMail({
      from: {
        name: "Merelaager",
        address: "no-reply@info.merelaager.ee",
      },
      to: contact.email,
      subject: "Broneeringu kinnitus",
      html: EmailBuilder.getBoilerplate(
        regCampers,
        resCampers,
        shifts,
        totalPrice,
      ),
      attachments: [
        {
          filename: `arve_${billNr}.pdf`,
          contentType: "application/pdf",
          content: fs.createReadStream(pdfPath),
        },
      ],
    });
  }

  sendRegistrationReceipt(campers: EmailReceiptInfo[], email: string) {
    return this._transporter.sendMail({
      from: {
        name: "Merelaager",
        address: "no-reply@info.merelaager.ee",
      },
      to: email,
      subject: "Reservnimekirja kandmise teade",
      html: EmailBuilder.getRegistrationReceipt(campers),
    });
  }

  sendPwdResetMail(email: string, token: string) {
    const link = `https://sild.merelaager.ee/reset?token=${token}`;
    return this._transporter.sendMail({
      from: {
        name: "Merelaager - süsteem",
        // address: "no-reply@sild.merelaager.ee",
        address: "no-reply@info.merelaager.ee",
      },
      to: email,
      subject: "Salasõna lähtestamine",
      html: `<p>Salasõna lähtestamise link: <a href="${link}">${link}</a>. Link toimib 20 minutit.</p><br />`,
    });
  }

  sendAccountCreationMail(email: string, token: string) {
    const link = `https://sild.merelaager.ee/signup?email=${email}&token=${token}`;
    return this._transporter.sendMail({
      from: {
        name: "Merelaager - süsteem",
        // address: "no-reply@sild.merelaager.ee",
        address: "no-reply@info.merelaager.ee",
      },
      to: email,
      subject: "e-Kambüüsi konto loomine",
      html: `<p>Konto loomise link: <a href="${link}">${link}</a>. Link toimib 24 tundi.</p><br />`,
    });
  }
}

export default MailService;
