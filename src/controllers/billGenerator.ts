import path from "path";
import fs from "fs";
import { Registration } from "../db/models/Registration";
import PDFDocument = PDFKit.PDFDocument;

const PDFDoc: PDFDocument = require("pdfkit");

const shiftDataPath = path.join(__dirname, "../../data/shiftdata.json");
const shiftData = JSON.parse(fs.readFileSync(shiftDataPath, "utf-8"));

const billMeta = {
  size: "A4",
  info: {
    Title: "Makseteatis",
    Author: "Laoküla merelaager",
  },
  margins: {
    top: 60,
    left: 60,
    right: 60,
    bottom: 40,
  },
};

const sideMargin = 60;
const contentTop = 60;

exports.getName = (child: Registration) => {
  const name = child.contactName.replace(/ /g, "_").toLowerCase();
  return `${child.billNr}.pdf`;
};

type contact = {
  name: string;
  email: string;
};

exports.generatePDF = async (
  campers: Registration[],
  names: string[],
  contact: contact,
  billNr: number,
  regCount: number
) => {
  const name = contact.name.replace(/ /g, "_").toLowerCase();
  let doc = new PDFDoc(billMeta);

  const oneThird = (doc.page.width - sideMargin * 2 - 10) / 3;

  const billName = `${billNr}.pdf`;

  const writeStream = fs.createWriteStream(`./data/arved/${billName}`);
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
    .text(contact.name, sideMargin, contentTop);
  doc.fontSize(11).font("Helvetica").text(contact.email);

  let firstShift = 5;
  campers.forEach((camper) => {
    if (camper.isRegistered && camper.shiftNr < firstShift)
      firstShift = camper.shiftNr;
  });
  const deadline = shiftData[firstShift]["deadline"];

  // Bill details
  const billTop = contentTop + 80;

  const today = new Date();
  const finalDeadline = new Date(deadline);
  const due = new Date();
  due.setDate(today.getDate() + 3);

  // If bill coincides with final deadline.
  const lenientDeadline = due > finalDeadline;

  // const billDate = today.toLocaleDateString("en-GB").replace(/\//g, ".");
  // const billDue = due.toLocaleDateString("en-GB").replace(/\//g, ".");

  const billDate = `${today.getDate()}.${
    today.getMonth() + 1
  }.${today.getFullYear()}`;
  const billDue = `${due.getDate()}.${
    due.getMonth() + 1
  }.${today.getFullYear()}`;
  const billDeadline = `${finalDeadline.getDate()}.${
    finalDeadline.getMonth() + 1
  }.${today.getFullYear()}`;

  const billNrLength = doc.widthOfString(`${billNr}`);
  const billDateLength = doc.widthOfString(billDate);
  const billDueLength = doc.widthOfString(billDue);
  const billFinalLength = doc.widthOfString(billDeadline);

  const billDataRightOffset = 310;

  doc
    .text("Makseteatise number:", sideMargin, billTop)
    .text("Makseteatise kuupäev:");

  if (lenientDeadline) doc.text("Maksetähtaeg:");
  else
    doc.text("Broneerimistasu maksetähtaeg:").text("Laagritasu maksetähtaeg:");

  doc
    .font("Helvetica-Bold")
    .text(
      `${billNr}`,
      doc.page.width - billDataRightOffset - billNrLength,
      billTop
    )
    .font("Helvetica")
    .text(billDate, doc.page.width - billDataRightOffset - billDateLength)
    .text(billDue, doc.page.width - billDataRightOffset - billDueLength);

  if (!lenientDeadline)
    doc.text(
      billDeadline,
      doc.page.width - billDataRightOffset - billFinalLength
    );
  doc.moveDown();
  doc
    .fontSize(10)
    .text(
      "Maksekorraldusel palume kindlasti märkida selgituseks makseteatise numbri ning lapse nime ja vahetuse.",
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
    svOld: {
      txt: "6päevane vahetus vanale olijale",
      count: 0,
      price: 80,
    },
    svNew: {
      txt: "6päevane vahetus uuele tulijale",
      count: 0,
      price: 100,
    },
    mvOld: {
      txt: "8päevane vahetus vanale olijale",
      count: 0,
      price: 120,
    },
    mvNew: {
      txt: "8päevane vahetus uuele tulijale",
      count: 0,
      price: 140,
    },
    lvOld: {
      txt: "12päevane vahetus vanale olijale",
      count: 0,
      price: 200,
    },
    lvNew: {
      txt: "12päevane vahetus uuele tulijale",
      count: 0,
      price: 220,
    },
    br: {
      txt: "Broneerimistasu",
      count: 0,
      price: 100,
    },
  };

  for (let i = 0; i < campers.length; ++i) {
    if (!campers[i].isRegistered) continue;

    switch (campers[i].shiftNr) {
      case 1:
        if (campers[i].isOld) ++counters.mvOld.count;
        else ++counters.mvNew.count;
        break;
      case 3:
        if (campers[i].isOld) ++counters.svOld.count;
        else ++counters.svNew.count;
        break;
      default:
        if (campers[i].isOld) ++counters.lvOld.count;
        else ++counters.lvNew.count;
        break;
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

  // Calculate price in db
  let realPrice = 0;
  campers.forEach((camper) => {
    realPrice += camper.priceToPay;
  });

  // Calculate discount
  let discount = 0;
  if (realPrice !== prePrice + brPrice)
    discount = prePrice + brPrice - realPrice;

  doc.moveDown();
  doc.fontSize(11);
  doc.text("", sideMargin);
  const brText = `Broneerimistasu: ${brPrice} €`;
  doc.text(brText, { align: "right" });
  const preText = `Laagritasu: ${prePrice} €`;
  doc.text(preText, { align: "right" });
  const sumText = `Kogusumma: ${prePrice + brPrice} €`;
  doc.text(sumText, { align: "right" });

  if (discount) {
    doc.moveDown();

    const discountText = `Soodustus: ${discount} €`;
    doc.text(discountText, { align: "right" });
  }

  doc.text("", sideMargin);
  doc.moveDown();
  doc.fontSize(12).font("Helvetica-Bold");
  doc.text(`Tasumisele kuulub: ${realPrice} €`, { align: "right" });

  // Camper names
  doc.moveDown(4).fontSize(11);
  doc.text("Selgitus", sideMargin);
  doc.moveDown();
  doc.fontSize(10).font("Helvetica");
  doc.text(`Makseteatis ${billNr}, `, { continued: true });
  let processedCampers = 0;
  for (let i = 0; i < campers.length; ++i) {
    if (!campers[i].isRegistered) continue;
    ++processedCampers;
    doc.text(`${names[i]} ${campers[i].shiftNr}v`, { continued: true });
    if (processedCampers !== regCount) doc.text(", ", { continued: true });
  }

  // Footer
  generateFooter(doc, oneThird);

  doc.save();
  doc.end();

  await new Promise<void>((resolve) => {
    writeStream.on("finish", () => {
      resolve();
    });
  });

  return billName;
};

const generateFooter = (doc: PDFDocument, oneThird: number) => {
  doc
    .moveTo(sideMargin, doc.page.height - 110)
    .lineTo(doc.page.width - sideMargin, doc.page.height - 110)
    .stroke();
  doc.fontSize(9).font("Helvetica");
  doc.text("", sideMargin);

  doc
    .text(
      "Sõudebaasi tee 23, 13517 Tallinn",
      sideMargin,
      doc.page.height - 70,
      {
        width: oneThird,
      }
    )
    .text("Reg nr. 80067875");
  doc
    .text(
      "info@merelaager.ee",
      sideMargin + 5 + oneThird,
      doc.page.height - 70,
      {
        width: oneThird,
      }
    )
    .text("+372 5628 6586");
  doc
    .text(
      "Swedbank EE862200221011493003",
      sideMargin + 10 + 2 * oneThird,
      doc.page.height - 70,
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
  doc.font("Helvetica-Bold");
  doc
    .text("MTÜ Noorte Mereklubi", sideMargin, doc.page.height - 90, {
      width: oneThird,
    })
    .text("Kontakt", sideMargin + 5 + oneThird, doc.page.height - 90, {
      width: oneThird * 2,
    })
    .text(
      "Arveldus",
      doc.page.width - sideMargin - bankLength,
      doc.page.height - 90,
      {
        width: oneThird,
      }
    );

  return doc;
};
