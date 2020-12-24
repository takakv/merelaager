require("dotenv").config();
const nodemailer = require("nodemailer");
// const hbs = require("nodemailer-express-handlebars");
const mg = require("nodemailer-mailgun-transport");

const generateHTML = (staff) => {
  return (
    "<b>Täname, et valisite merelaagri!</b>" +
    `<p>Laagri ${staff.id}es osalemise võimalus on edukalt broneeritud.</p>` +
    "<p>Palume kohe üle kanda ka koha broneeriise tasu (või kogu summa). " +
    "Laagrikoht saab lõpliku kinnituse, kui makse on meile laekunud kolme päeva jooksul. Arve leiate manusest.</p>" +
    "<p>Kui makse pole kolme päeva jooksul meile laekunud, tõstame lapse reservnimekirja.</p>" +
    `<p>${staff.name} - ${staff.email}.</p><br>` +
    "<small>Tegu on automaatvastusega, palume sellele meilile mitte vastata. " +
    "Küsimuste või murede korral pöörduge palun vahetuse juhataja poole.</small>"
  );
};

class MailService {
  constructor() {
    const options = {
      viewEngine: {
        partialsDir: "email/partials",
        layoutsDir: "email/layouts",
        defaultLayout: "main",
        extname: ".hbs",
      },
      extname: ".hbs",
      viewPath: "email",
    };

    const config = {
      auth: {
        api_key: process.env.EMAIL_API,
        domain: process.env.EMAIL_SERV,
      },
      host: "api.eu.mailgun.net",
    };

    this._transporter = nodemailer.createTransport(mg(config));
    // this._transporter.use("compile", hbs(options));
  }

  sendMail({ to, staff }) {
    return this._transporter.sendMail({
      to,
      from: {
        name: "Broneerimine | Merelaager",
        address: "bronn@merelaager.ee",
      },
      subject: "Broneeringu kinnitus",
      html: generateHTML(staff),
    });
  }
}

module.exports = MailService;
