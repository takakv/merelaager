import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import nodemailer, { Transporter } from "nodemailer";

dotenv.config();

const mg = require("nodemailer-mailgun-transport");

const boilerplate = require("./mailService/boilerplate");

const shiftDataPath = path.join(__dirname, "../../data/shiftdata.json");
const shiftData = JSON.parse(fs.readFileSync(shiftDataPath, "utf-8"));

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

  sendConfirmationMail(
    campers,
    names: string[],
    contact: contact,
    price: number,
    pdfName: string,
    regCount: number,
    billNr: number
  ) {
    const pdfPath = path.resolve(
      path.join(__dirname, "../../data/arved", pdfName)
    );
    return this._transporter.sendMail({
      from: {
        name: "Merelaager",
        address: "no-reply@info.merelaager.ee",
      },
      to: contact.email,
      subject: "Broneeringu kinnitus",
      html: boilerplate.getBoilerplate(campers, names, price, regCount), //generateHTML(campers, names, price, regCount),
      attachments: [
        {
          filename: `arve_${billNr}.pdf`,
          contentType: "application/pdf",
          content: fs.createReadStream(pdfPath),
        },
      ],
    });
  }

  sendFailureMail(campers, contact: contact) {
    return this._transporter.sendMail({
      from: {
        name: "Merelaager",
        address: "no-reply@info.merelaager.ee",
      },
      to: contact.email,
      subject: "Reservnimekirja kandmise teade",
      html: boilerplate.getFailed(campers),
    });
  }

  sendPwdResetMail(email: string, token: string) {
    const link = `https://merelaager.ee/api/su/reset/${token}`;
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
    const link = `https://merelaager.ee/api/account/create/${token}`;
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
