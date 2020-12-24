require("dotenv").config();
const nodemailer = require("nodemailer");
// const hbs = require("nodemailer-express-handlebars");
const mg = require("nodemailer-mailgun-transport");

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

  sendMail({ to, shift }) {
    return this._transporter.sendMail({
      to,
      from: {
        name: "Broneerimine | Merelaager",
        address: "bronn@merelaager.ee",
      },
      subject: "Ootame teid merelaagrisse!",
      html: `<b>${shift}</b>`
    });
  }
}

module.exports = MailService;
