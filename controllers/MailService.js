require("dotenv").config();
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const fs = require("fs");

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

const generateHTML = (campers, price) => {
  const shifts = [];
  let response = "<b>Täname, et valisite merelaagri!</b>" + "<ul>";
  for (let i = 0; i < campers.length; ++i) {
    if (!shifts.includes(campers[i].vahetus)) shifts.push(campers[i].vahetus);
    response += `<li>${campers[i].nimi} (${
      shiftData[campers[i].vahetus].id
    })</li>`;
  }
  response += "</ul>";
  response += "<p>on registreeritud.</p>";
  response +=
    "<p>Palume kohe üle kanda ka koha broneerimise tasu (või kogu summa). " +
    "Laagrikoht saab lõpliku kinnituse, kui makse on meile laekunud kolme päeva jooksul. Arve leiate manusest.</p>";
  response += `<p>Tasuda: ${price} €.`;
  response +=
    "<p>MTÜ Noorte mereklubi" +
    "<br>Konto: EE86220022101149300" +
    "<br>SWIFT kood/BIC:HABAEE2X" +
    "<br>SWEDBANK" +
    "<br><b>Kindlasti märkige selgitusse lapse nimi ja vahetus!</b></p>";
  response +=
    "<p>Kui makse pole kolme päeva jooksul meile laekunud, tõstame lapse reservnimekirja.</p>";
  response += "<p>Parimate soovidega</p>";
  response += "<p>";
  for (let i = 0; i < shifts.length; ++i) {
    response += `${shiftData[shifts[i]].name} (${shiftData[shifts[i]].email})`;
    if (i + 1 !== shifts.length) response += ", ";
  }
  response += "</p>";
  response +=
    "<small>Tegu on automaatvastusega, palume sellele meilile mitte vastata. " +
    "Küsimuste või murede korral pöörduge palun vahetuse juhataja poole.</small>";
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

  sendMail(campers, price) {
    return this._transporter.sendMail({
      to: campers[0].kontakt_email,
      from: {
        name: "Broneerimine - merelaager",
        address: "bronn@merelaager.ee",
      },
      subject: "Broneeringu kinnitus",
      html: generateHTML(campers, price),
    });
  }
}

module.exports = MailService;
