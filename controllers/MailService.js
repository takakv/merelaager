require("dotenv").config();
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const fs = require("fs");

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

const generateHTML = (campers, price, regCount) => {
  const shifts = [];
  let response = "<b>Täname, et valisite merelaagri!</b>" + "<ul>";
  for (let i = 0; i < campers.length; ++i) {
    if (!shifts.includes(campers[i].shift)) shifts.push(campers[i].shift);
    if (!campers[i].isRegistered) continue;
    response += `<li>${campers[i].name} (${
      shiftData[campers[i].shift].id
    })</li>`;
  }
  response += "</ul>";
  response += "<p>on registreeritud.</p>";
  if (regCount !== campers.length) {
    response += "<ul>";
    for (let i = 0; i < campers.length; ++i) {
      if (campers[i].shift) continue;
      response += `<li>${campers[i].name} (${
        shiftData[campers[i].shift].id
      })</li>`;
    }
    response += "</ul>";
    response +=
      "<p>on lisatud reservnimekirja. Kui põhinimekirjas koht vabaneb, võtame teiega esimesel võimalusel ühendust. " +
      "Palun võtke vahetuse juhatajaga ühendust, kui soovite registreerimise tühistada.</p>";
  }
  response +=
    "<p>Palume üle kanda ka koha broneerimise tasu (või kogu summa). " +
    "Laagrikoht saab lõpliku kinnituse, kui makse on meile laekunud kolme päeva jooksul. Makseteatise leiate manusest.</p>";
  response += `<p>Tasuda: ${
    50 * regCount
  } €. Kogusumma (k.a broneerimistasu): ${price} €.`;
  response +=
    "<p>MTÜ Noorte Mereklubi" +
    "<br>Konto: EE862200221011493003" +
    "<br>SWIFT kood/BIC:HABAEE2X" +
    "<br>SWEDBANK" +
    "<br><b>Kindlasti märkige selgitusse lapse nimi ja vahetus!</b></p>";
  response +=
    "<p>Kui makse pole kolme päeva jooksul meile laekunud, tõstame lapse reservnimekirja.</p>";
  response += "<p>Parimate soovidega</p>";
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

const generateFailureHTML = (campers) => {
  const shifts = [];
  for (let i = 0; i < campers.length; ++i) {
    if (!shifts.includes(campers[i].shift)) shifts.push(campers[i].shift);
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
  response += "<p>Parimate soovidega</p>";
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

const generateInfoHTML = (campers, price, billNr, regCount) => {
  let response = "<ul>";
  for (let i = 0; i < campers.length; ++i) {
    if (!campers[i].isRegistered) continue;
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
    `Arve nr ${billNr}, hind: ${price}, bronnitasu: ${regCount * 50}.`;
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

  sendConfirmationMail(campers, price, pdfName, regCount, billNr) {
    return this._transporter.sendMail({
      from: {
        name: "Broneerimine - merelaager",
        address: "bronn@merelaager.ee",
      },
      to: campers[0].contactEmail,
      subject: "Broneeringu kinnitus",
      html: generateHTML(campers, price, regCount),
      attachments: [
        {
          filename: `${billNr}.pdf`,
          path: `./data/arved/${pdfName}`,
          contentType: "application/pdf",
        },
      ],
    });
  }

  sendFailureMail(campers) {
    return this._transporter.sendMail({
      from: {
        name: "Broneerimine - merelaager",
        address: "bronn@merelaager.ee",
      },
      to: campers[0].contactEmail,
      subject: "Reservnimekirja kandmise teade",
      html: generateFailureHTML(campers),
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
}

module.exports = MailService;
