const MailService = require("./MailService");
const PDFDoc = require("pdfkit");
const db = require("../models/database");
const fs = require("fs");

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

const mailService = new MailService();

const Camper = db.campers;

exports.create = (req, res) => {
  const childCount = parseInt(req.body["childCount"]);
  let campers = [];
  for (let i = 1; i < childCount + 1; ++i) {
    const hasIdCode = req.body[`useIdCode-${i}`] !== "false";
    const isRookie = req.body[`newAtCamp-${i}`] === "true";
    const isEmsa = req.body[`emsa-${i}`] === "true";
    let idCode = req.body[`idCode-${i}`];
    let gender = req.body[`gender-${i}`];
    let birthday = req.body[`bDay-${i}`];
    if (hasIdCode && idCode) {
      switch (idCode.charAt(0)) {
        case "5":
          gender = "Poiss";
          break;
        case "6":
          gender = "Tüdruk";
          break;
      }
      const year = 2000 + parseInt(idCode.slice(1, 3));
      // Js counts month from 0 - 11.
      const month = parseInt(idCode.slice(3, 5)) - 1;
      const day = parseInt(idCode.slice(5, 7));
      birthday = new Date(year, month, day);
    } else if (gender) {
      switch (gender) {
        case "M":
          gender = "Poiss";
          break;
        case "F":
          gender = "Tüdruk";
          break;
      }
    }
    campers.push({
      nimi: req.body[`name-${i}`],
      isikukood: idCode,
      sugu: gender,
      synnipaev: birthday,
      vana_olija: !isRookie,
      vahetus: req.body[`vahetus-${i}`],
      ts_suurus: req.body[`shirtsize-${i}`],
      lisainfo: req.body[`addendum-${i}`],
      tanav: req.body[`road-${i}`],
      linn: req.body[`city-${i}`],
      riik: req.body[`country-${i}`],
      maakond: req.body[`county-${i}`],
      emsa: isEmsa,
      kontakt_nimi: req.body.guardian_name,
      kontakt_number: req.body.guardian_phone,
      kontakt_email: req.body.guardian_email,
      varu_tel: req.body.alt_phone,
    });
  }
  Camper.bulkCreate(campers)
    .then((data) => res.send(data))
    .catch((err) =>
      res.status(500).send({
        message: err.message || "Midagi läks nihu.",
      })
    );

  const price = calculatePrice(campers);
  generatePDF(campers, price);
};

const mailer = async (campers, price, pdfName) =>
  await mailService.sendMail(campers, price, pdfName);

const calculatePrice = (campers) => {
  let price = 0;
  campers.forEach((camper) => {
    price += shiftData[camper.vahetus].price;
    if (camper.linn.toLowerCase() === "tallinn") price -= 20;
    else if (camper.vana_olija) price -= 10;
  });
  return price;
};

const generatePDF = (campers, price) => {
  const name = campers[0].kontakt_nimi.replace(/ /g, "_").toLowerCase();
  const doc = new PDFDoc({
    size: "A4",
    info: {
      Title: "Arve",
      Author: "Laoküla merelaager",
    },
  });

  const sideMargin = 60;
  const contentTop = 60;
  const oneSeventh = (doc.page.width - sideMargin * 2 - 10) / 7;
  const oneThird = (doc.page.width - sideMargin * 2 - 10) / 3;

  const writeStream = fs.createWriteStream(`./data/arved/arve_${name}.pdf`);
  doc.pipe(writeStream);
  // ML logo
  doc.image(
    "./media/files/bluelogo.png",
    doc.page.width - sideMargin - 60,
    contentTop / 2,
    { width: 60 }
  );
  // Target name
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(campers[0].kontakt_nimi, sideMargin, contentTop);

  // Bill details
  const billTop = contentTop + 80;

  doc.fontSize(11).font("Helvetica");
  const billNr = "21001";

  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + 4);

  const billDate = today.toLocaleDateString("et").replace(/\//g, ".");
  const billDue = due.toLocaleDateString("et").replace(/\//g, ".");

  const billNrLength = doc.widthOfString(billNr);
  const billDateLength = doc.widthOfString(billDate);
  const billDueLength = doc.widthOfString(billDue);

  const billDataRightOffset = 370;

  doc
    .text("Arve number:", sideMargin, billTop)
    .text("Arve kuupäev:")
    .text("Maksetähtaeg:");
  doc
    .font("Helvetica-Bold")
    .text(billNr, doc.page.width - billDataRightOffset - billNrLength, billTop)
    .font("Helvetica")
    .text(billDate, doc.page.width - billDataRightOffset - billDateLength)
    .text(billDue, doc.page.width - billDataRightOffset - billDueLength);
  doc.moveDown();
  doc
    .fontSize(10)
    .text(
      "Maksekorraldusel palume kindlasti märkida selgituseks arve numbri ning lapse nime ja vahetuse.",
      sideMargin
    );

  // Main contents
  doc.moveDown(4);
  doc.fontSize(12).font("Helvetica-Bold");
  doc.text("Kirjeldus");
  doc.moveUp();
  doc.text("Kogus", doc.page.width - sideMargin - 200);
  doc.moveUp();
  const width = doc.widthOfString("Hind");
  doc.text("Hind", doc.page.width - sideMargin - 100);
  doc.moveDown();
  doc.fontSize(10).font("Helvetica");

  const counters = {
    sv1: {
      txt: "8päevane vahetus Tallinna lapsele",
      count: 0,
      price: 130,
    },
    sv2: {
      txt: "8päevane vahetus vanale olijale",
      count: 0,
      price: 140,
    },
    sv3: {
      txt: "8päevane vahetus uuele tulijale",
      count: 0,
      price: 150,
    },
    lv1: {
      txt: "12päevane vahetus Tallinna lapsele",
      count: 0,
      price: 220,
    },
    lv2: {
      txt: "12päevane vahetus vanale olijale",
      count: 0,
      price: 230,
    },
    lv3: {
      txt: "12päevane vahetus uuele tulijale",
      count: 0,
      price: 240,
    },
    br: {
      txt: "Broneerimistasu",
      count: 0,
      price: 50,
    },
  };
  for (let i = 0; i < campers.length; ++i) {
    if (campers[i].vahetus === "1v") {
      if (campers[i].linn.toLowerCase() === "tallinn") ++counters.sv1.count;
      else if (campers[i].vana_olija) ++counters.sv2.count;
      else ++counters.sv3.count;
    } else {
      console.log(campers[i].vana_olija);
      if (campers[i].linn.toLowerCase() === "tallinn") ++counters.lv1.count;
      else if (campers[i].vana_olija) ++counters.lv2.count;
      else ++counters.lv3.count;
    }
    ++counters.br.count;
  }

  let prePrice = 0;
  const brPrice = counters.br.count * counters.br.price;
  for (let [key, value] of Object.entries(counters)) {
    if (value.count) {
      if (key !== "br") prePrice += value.count * value.price;
      doc.text(value.txt, sideMargin);
      doc.moveUp();
      doc.text(`x${value.count}`, doc.page.width - sideMargin - 200);
      doc.moveUp();
      doc.text(`${value.price} €`, doc.page.width - sideMargin - 100);
      doc.moveDown();
    }
  }
  doc.moveDown();
  doc.fontSize(11);
  doc.text("", sideMargin);
  const preText = `Summa broneerimistasuta: ${prePrice} €`;
  doc.text(preText, { align: "right" });
  const brText = `Broneerimistasu: ${brPrice} €`;
  doc.text(brText, { align: "right" });
  const sumText = `Arve summa: ${prePrice + brPrice} €`;
  doc.text(sumText, { align: "right" });

  doc.text("", sideMargin);
  doc.moveDown();
  doc.fontSize(12).font("Helvetica-Bold");
  doc.text(`Tasumisele kulub: ${prePrice + brPrice} €`, { align: "right" });

  // Camper names
  doc.moveDown(4).fontSize(11);
  doc.text("Selgitus", sideMargin);
  doc.moveDown();
  doc.fontSize(10).font("Helvetica");
  doc.text(`Arve 21001, `, { continued: true });
  for (let i = 0; i < campers.length; ++i) {
    doc.text(
      `${campers[i].nimi} ${shiftData[campers[i].vahetus].id.slice(0, 4)}`,
      {
        continued: true,
      }
    );
    if (campers[i] !== campers[campers.length - 1])
      doc.text(", ", { continued: true });
  }

  // Footer
  doc
    .moveTo(sideMargin, doc.page.height - 140)
    .lineTo(doc.page.width - sideMargin, doc.page.height - 140)
    .stroke();
  doc.fontSize(9).font("Helvetica");
  doc.text("", sideMargin);

  const footerHeadingGap = 50;
  doc
    .text(
      "Sõudebaasi tee 23, 13517 Tallinn",
      sideMargin,
      doc.page.height - 100,
      {
        width: oneThird,
      }
    )
    .text("Reg nr. 80067875");
  doc
    .text(
      "info@merelaager.ee",
      sideMargin + 5 + oneThird,
      doc.page.height - 100,
      {
        width: oneThird,
      }
    )
    .text("+372 5628 6586");
  doc
    .text(
      "Swedbank EE862200221011493003",
      sideMargin + 10 + 2 * oneThird,
      doc.page.height - 100,
      {
        align: "right",
        width: oneThird,
      }
    )
    .text("HABAEE2X", {
      align: "right",
      width: oneThird,
    });

  const bankLength = doc.widthOfString("Swedbank EE862200221011493003");

  // Footer headings
  doc.font("Helvetica-Bold");
  doc
    .text("MTÜ Noorte Mereklubi", sideMargin, doc.page.height - 120, {
      width: oneThird,
    })
    .text("Kontakt", sideMargin + 5 + oneThird, doc.page.height - 120, {
      width: oneThird * 2,
    })
    .text(
      "Arveldus",
      doc.page.width - sideMargin - bankLength,
      doc.page.height - 120,
      {
        width: oneThird,
      }
    );
  doc.save();
  writeStream.on("finish", () => {
    mailer(campers, price, `arve_${name}.pdf`)
      .then(() => console.log("Success"))
      .catch((error) => console.log(error));
  });
  doc.end();
};
