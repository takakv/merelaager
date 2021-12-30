require("dotenv").config();
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const fs = require("fs");

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

const registered = (campers, shifts) => {
  let response = "<ul>";

  for (let i = 0; i < campers.length; ++i) {
    const camper = campers[i];

    if (!shifts.includes(camper.shiftNr)) shifts.push(camper.shiftNr);
    if (!camper.isRegistered) continue;
    response += `<li>${camper.name} (${camper.shiftNr}. vahetus)</li>`;
  }

  response += "</ul>";
  response += "<p>on registreeritud.</p>";

  return response;
};

const nonRegistered = (campers) => {
  let response = "<ul>";

  for (let i = 0; i < campers.length; ++i) {
    const camper = campers[i];
    if (camper.isRegistered) continue;
    response += `<li>${camper.name} (${camper.shiftNr}. vahetus)</li>`;
  }

  response += "</ul>";
  response +=
    "<p>on lisatud reservnimekirja. Kui põhinimekirjas koht vabaneb, võtame teiega esimesel võimalusel ühendust. " +
    "Palun võtke vahetuse juhatajaga ühendust, kui soovite registreerimise tühistada.</p>";

  return response;
};

const payment = (regCount, price) => {
  let response =
    "<p>Palume üle kanda ka koha broneerimise tasu (või kogu summa). " +
    "Laagrikoht saab lõpliku kinnituse, kui makse on meile laekunud kolme päeva jooksul. Makseteatise leiate manusest.</p>";
  response += `<p>Tasuda: ${
    100 * regCount
  } €. Kogusumma (k.a broneerimistasu): ${price} €.`;
  response +=
    "<p>MTÜ Noorte Mereklubi" +
    "<br>Konto: EE862200221011493003" +
    "<br>SWIFT kood/BIC:HABAEE2X" +
    "<br>SWEDBANK" +
    "<br><b>Kindlasti märkige selgitusse lapse nimi ja vahetus!</b></p>";
  response +=
    "<p>Kui makse pole kolme päeva jooksul meile laekunud, tõstame lapse reservnimekirja.</p>";

  return response;
};

const footer = (shifts) => {
  let response = "<p>Parimate soovidega</p>";
  response += "<p>";
  for (let i = 0; i < shifts.length; ++i) {
    response += `${shiftData[shifts[i]].name} (${
      shiftData[shifts[i]]["email"]
    }, tel. ${shiftData[shifts[i]].phone})`;
    if (i + 1 !== shifts.length) response += ", ";
  }
  response += "</p>";
  response +=
    "<small>Tegu on automaatvastusega, palume sellele meilile mitte vastata. " +
    "Küsimuste või murede korral pöörduge palun vahetuse juhataja poole.</small>";

  return response;
};

const generateHTML = (campers, names, price, regCount) => {
  const shifts = [];
  for (let i = 0; i < campers.length; ++i) {
    campers[i].name = names[i];
  }

  let response = "<b>Täname, et valisite merelaagri!</b>";

  // Registered campers.
  response += registered(campers, shifts);

  // Non-registered campers.
  if (regCount !== campers.length) response += nonRegistered(campers);

  // Payment and Price.
  response += payment(regCount, price);

  // Footer.
  response += footer(shifts);

  return response;
};

const generateFailureHTML = (campers) => {
  const shifts = [];

  for (let i = 0; i < campers.length; ++i) {
    if (!shifts.includes(campers[i].shiftNr)) shifts.push(campers[i].shiftNr);
  }

  let response = "<b>Täname, et valisite merelaagri!</b>";

  if (campers.length === 1)
    response +=
      "<p>Kahjuks on vahetuse kohad juba täis. Oleme lapse registreerinud reservnimekirja. " +
      "Kui põhinimekirjas koht vabaneb, võtame teiega esimesel võimalusel ühendust.</p>";
  else
    response +=
      "<p>Kahjuks on kõik soovitud kohad juba täis. Oleme registreerinud lapsed reservnimekirja. " +
      "Kui põhinimekirjas mõni koht vabaneb, võtame teiega esimesel võimalusel ühendust.</p>";

  response += footer(shifts);
  return response;
};

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
    return this._transporter.sendMail({
      from: {
        name: "Merelaager",
        address: "bronn@merelaager.ee",
      },
      to: contact.email,
      subject: "Broneeringu kinnitus",
      html: generateHTML(campers, names, price, regCount),
      attachments: [
        {
          filename: `${billNr}.pdf`,
          path: `./data/arved/${pdfName}`,
          contentType: "application/pdf",
        },
      ],
    });
  }

  sendFailureMail(campers, contact) {
    return this._transporter.sendMail({
      from: {
        name: "Merelaager",
        address: "bronn@merelaager.ee",
      },
      to: contact.email,
      subject: "Reservnimekirja kandmise teade",
      html: generateFailureHTML(campers),
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
