require("dotenv").config();
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const fs = require("fs");

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

const generateHTML = (campers, price, regCount) => {
  const shifts = [];
  let response = "<b>Täname, et valisite merelaagri!</b>" + "<ul>";
  for (let i = 0; i < campers.length; ++i) {
    if (!shifts.includes(campers[i].vahetus)) shifts.push(campers[i].vahetus);
    if (!campers[i].registreeritud) continue;
    response += `<li>${campers[i].nimi} (${
      shiftData[campers[i].vahetus].id
    })</li>`;
  }
  response += "</ul>";
  response += "<p>on registreeritud.</p>";
  if (regCount !== campers.length) {
    response += "<ul>";
    for (let i = 0; i < campers.length; ++i) {
      if (campers[i].registreeritud) continue;
      response += `<li>${campers[i].nimi} (${
        shiftData[campers[i].vahetus].id
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
    "<br>Konto: EE86220022101149300" +
    "<br>SWIFT kood/BIC:HABAEE2X" +
    "<br>SWEDBANK" +
    "<br><b>Kindlasti märkige selgitusse lapse nimi ja vahetus!</b></p>";
  response +=
    "<p>Kui makse pole kolme päeva jooksul meile laekunud, tõstame lapse reservnimekirja.</p>";
  response += "<p>Parimate soovidega</p>";
  response += "<p>";
  for (let i = 0; i < shifts.length; ++i) {
    response += `${shiftData[shifts[i]].name} (${
      shiftData[shifts[i]].email
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
    if (!shifts.includes(campers[i].vahetus)) shifts.push(campers[i].vahetus);
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
      shiftData[shifts[i]].email
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
    if (!campers[i].registreeritud) continue;
    response += `<li>${campers[i].nimi} (${
      shiftData[campers[i].vahetus].id
    }), `;
    response += `sugu: ${campers[i].sugu}, `;
    response += `sünnipäev: ${campers[i].synnipaev}, `;
    response += `t-särgi suurus: ${campers[i].ts_suurus}, `;
    response += `uus: ${campers[i].vana_olija ? "ei" : "jah"}, `;
    response += `EMSA toetus: ${campers[i].emsa ? "jah" : "ei"}, `;
    response += `aadress: ${campers[i].tanav}, ${campers[i].linn}, ${campers[i].maakond}, ${campers[i].riik}, `;
    response += `muu info: ${campers[i].lisainfo}`;
    response += "</li>";
  }
  response += "</ul>";
  response += "<p>on registreeritud.</p>";
  if (regCount !== campers.length) {
    response += "<ul>";
    for (let i = 0; i < campers.length; ++i) {
      if (campers[i].registreeritud) continue;
      response += `<li>${campers[i].nimi} (${
        shiftData[campers[i].vahetus].id
      }), `;
      response += `sugu: ${campers[i].sugu}, `;
      response += `sünnipäev: ${campers[i].synnipaev}, `;
      response += `t-särgi suurus: ${campers[i].ts_suurus}, `;
      response += `uus: ${campers[i].vana_olija ? "ei" : "jah"}, `;
      response += `EMSA toetus: ${campers[i].emsa ? "jah" : "ei"}, `;
      response += `aadress: ${campers[i].tanav}, ${campers[i].linn}, ${campers[i].maakond}, ${campers[i].riik}, `;
      response += `muu info: ${campers[i].lisainfo}`;
      response += "</li>";
    }
    response += "</ul>";
    response += "<p>on lisatud reservnimekirja.</p>";
  }
  response += "<p>Kontaktandmed:</p>";
  response += "<p>";
  response +=
    `${campers[0].kontakt_nimi}, ${campers[0].kontakt_email}, tel: ${campers[0].kontakt_number}` +
    `${campers[0].varu_tel ? " (" + campers[0].varu_tel + "), " : ", "}` +
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
      to: campers[0].kontakt_email,
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
      to: campers[0].kontakt_email,
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
      subject: `Registreerimine - ${campers[0].kontakt_nimi}`,
      html: generateInfoHTML(campers, price, billNr, regCount),
    });
  }
}

module.exports = MailService;
