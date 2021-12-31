require("dotenv").config();
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const fs = require("fs");
const path = require("path");
const boilerplate = require("./mailService/boilerplate");

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

const generateInfoHTML = (campers, price, billNr, regCount) => {
  let response = "<ul>";
  for (let i = 0; i < campers.length; ++i) {
    if (!campers[i].isRegistered) continue;
    response += `<li>${campers[i].name} (${shiftData[campers[i].shift].id}), `;
    response += `sugu: ${campers[i].gender}, `;
    response += `sünnipäev: ${campers[i].birthday}, `;
    response += `t-särgi suurus: ${campers[i].tsSize}, `;
    response += `uus: ${campers[i].isOld ? "ei" : "jah"}, `;
    response += `EMSA toetus: ${campers[i].isEmsa ? "jah" : "ei"}, `;
    response += `aadress: ${campers[i].road}, ${campers[i].city}, ${campers[i].county}, ${campers[i].country}, `;
    response += `muu info: ${campers[i].addendum}`;
    response += "</li>";
  }
  response += "</ul>";
  response += "<p>on registreeritud.</p>";
  if (regCount !== campers.length) {
    response += "<ul>";
    for (let i = 0; i < campers.length; ++i) {
      if (campers[i].isRegistered) continue;
      response += `<li>${campers[i].name} (${
        shiftData[campers[i].shift].id
      }), `;
      response += `sugu: ${campers[i].gender}, `;
      response += `sünnipäev: ${campers[i].birthday}, `;
      response += `t-särgi suurus: ${campers[i].tsSize}, `;
      response += `uus: ${campers[i].isOld ? "ei" : "jah"}, `;
      response += `EMSA toetus: ${campers[i].isEmsa ? "jah" : "ei"}, `;
      response += `aadress: ${campers[i].road}, ${campers[i].city}, ${campers[i].county}, ${campers[i].country}, `;
      response += `muu info: ${campers[i].addendum}`;
      response += "</li>";
    }
    response += "</ul>";
    response += "<p>on lisatud reservnimekirja.</p>";
  }
  response += "<p>Kontaktandmed:</p>";
  response += "<p>";
  response +=
    `${campers[0].contactName}, ${campers[0].contactEmail}, tel: ${campers[0].contactNumber}` +
    `${campers[0].backupTel ? " (" + campers[0].backupTel + "), " : ", "}` +
    `Arve nr ${billNr}, hind: ${price}, bronnitasu: ${regCount * 100}.`;
  return response;
};

class MailService {
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
    names,
    contact,
    price,
    pdfName,
    regCount,
    billNr
  ) {
    const pdfPath = path.resolve(
      path.join(__dirname, "../data/arved", pdfName)
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

  sendFailureMail(campers, contact) {
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

  sendPwdResetMail(email, token) {
    const link = `https://merelaager.ee/api/su/reset/${token}`;
    return this._transporter.sendMail({
      from: {
        name: "Merelaager - süsteem",
        address: "no-reply@merelaager.ee",
      },
      to: email,
      subject: "Salasõna lähtestamine",
      html: `<p>Salasõna lähtestamise link: <a href="${link}">${link}</a>. Link toimib 20 minutit.</p><br />`,
    });
  }

  sendAccountCreationMail(email, token) {
    const link = `https://merelaager.ee/api/su/${token}/`;
    return this._transporter.sendMail({
      from: {
        name: "Merelaager - süsteem",
        address: "no-reply@merelaager.ee",
      },
      to: email,
      subject: "e-Kambüüsi konto loomine",
      html: `<p>Konto loomise link: <a href="${link}">${link}</a>. Link toimib 24 tundi.</p><br />`,
    });
  }

  sendCampMasterEmail(campers, price, billNr, regCount) {
    return this._transporter.sendMail({
      from: {
        name: "Broneerimine - merelaager",
        address: "bronn@merelaager.ee",
      },
      to: "kati@merelaager.ee",
      subject: `Registreerimine - ${campers[0].contactName}`,
      html: generateInfoHTML(campers, price, billNr, regCount),
    });
  }

  sendCheckMail(source, dest, content) {
    console.log("Sending email");
    console.log(source);
    console.log(dest);
    console.log(typeof source);
    console.log(typeof dest);
    return this._transporter.sendMail({
      from: {
        name: "Test",
        address: source,
      },
      to: dest,
      subject: "Süsteemi katse",
      html: content,
    });
  }
}

module.exports = MailService;
