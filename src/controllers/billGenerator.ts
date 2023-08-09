import fs from "fs";
import path from "path";
import PDFDoc from "pdfkit";

import PDFDocument = PDFKit.PDFDocument;
import PDFDocumentOptions = PDFKit.PDFDocumentOptions;

import { Registration } from "../db/models/Registration";

type Contact = {
  name: string;
  email: string;
};

type ShiftData = {
  name: string;
  email: string;
  phone: string;
  price: number;
  deadline: string;
};

const shiftDataPath = path.join(__dirname, "../../data/shiftdata.json");
const shiftData = JSON.parse(fs.readFileSync(shiftDataPath, "utf-8")) as {
  [key: number]: ShiftData;
};

const SIDE_MARGIN = 60;
const CONTENT_TOP = 60;
const CONTENT_BOTTOM = 40;
const LOGO_WIDTH = 60;

const FONT_PRIMARY = "Helvetica";
const FONT_PRIMARY_BOLD = "Helvetica-Bold";

const DATE_LOCALE = "et";
const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
};

const BILL_META: PDFDocumentOptions = {
  size: "A4",
  info: {
    Title: "Makseteatis",
    Author: "Laoküla merelaager",
  },
  margins: {
    top: CONTENT_TOP,
    left: SIDE_MARGIN,
    right: SIDE_MARGIN,
    bottom: CONTENT_BOTTOM,
  },
};

class BillBuilder {
  public static generatePdf = async (
    campers: Registration[],
    contact: Contact,
    billNr: number,
    regCount: number
  ) => {
    const name = contact.name.replace(/ /g, "_").toLowerCase();
    const doc = new PDFDoc(BILL_META);

    const oneThird = (doc.page.width - SIDE_MARGIN * 2 - 10) / 3;

    const billName = `${billNr}.pdf`;

    const writeStream = fs.createWriteStream(`./data/arved/${billName}`);
    doc.pipe(writeStream);

    // ML logo
    doc.image(
      "./media/files/bluelogo.png",
      doc.page.width - SIDE_MARGIN - LOGO_WIDTH,
      CONTENT_TOP / 2,
      { width: LOGO_WIDTH }
    );

    // Target name
    doc
      .fontSize(22)
      .font(FONT_PRIMARY_BOLD)
      .text(contact.name, SIDE_MARGIN, CONTENT_TOP);
    doc.fontSize(11).font(FONT_PRIMARY).text(contact.email);

    let firstShift = 5;
    campers.forEach((camper) => {
      if (camper.isRegistered && camper.shiftNr < firstShift)
        firstShift = camper.shiftNr;
    });
    const deadline = shiftData[firstShift]["deadline"];

    // Bill details
    const billTop = CONTENT_TOP + 80;

    const today = new Date();
    const finalDeadline = new Date(deadline);
    const due = new Date();
    due.setDate(today.getDate() + 3);

    // If bill coincides with final deadline.
    const lenientDeadline = due > finalDeadline;

    const billDate = today.toLocaleDateString(DATE_LOCALE, DATE_OPTIONS);
    const billDue = due.toLocaleDateString(DATE_LOCALE, DATE_OPTIONS);
    const billDeadline = finalDeadline.toLocaleDateString(
      DATE_LOCALE,
      DATE_OPTIONS
    );

    const billNrLength = doc.widthOfString(`${billNr}`);
    const billDateLength = doc.widthOfString(billDate);
    const billDueLength = doc.widthOfString(billDue);
    const billFinalLength = doc.widthOfString(billDeadline);

    const billDataRightOffset = 310;

    doc
      .text("Makseteatise number:", SIDE_MARGIN, billTop)
      .text("Makseteatise kuupäev:");

    if (lenientDeadline) {
      doc.text("Maksetähtaeg:");
    } else {
      doc
        .text("Broneerimistasu maksetähtaeg:")
        .text("Laagritasu maksetähtaeg:");
    }

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
        SIDE_MARGIN
      );

    // Main contents
    doc.moveDown(4);
    doc.fontSize(12).font(FONT_PRIMARY_BOLD);
    doc.text("Kirjeldus");
    doc.moveUp();
    doc.text("Kogus", doc.page.width - SIDE_MARGIN - 200);
    doc.moveUp();
    const width = doc.widthOfString("Hind");
    doc.text("Hind", doc.page.width - SIDE_MARGIN - 100);
    doc.moveDown();
    doc.fontSize(10).font(FONT_PRIMARY);

    const counters = {
      childOld: {
        txt: "12päevane vahetus vanale olijale",
        count: 0,
        price: 220,
      },
      childNew: {
        txt: "12päevane vahetus uuele tulijale",
        count: 0,
        price: 240,
      },
      booking: {
        txt: "Broneerimistasu",
        count: 0,
        price: 100,
      },
    };

    for (let i = 0; i < campers.length; ++i) {
      if (!campers[i].isRegistered) continue;

      if (campers[i].isOld) ++counters.childOld.count;
      else ++counters.childNew.count;

      ++counters.booking.count;
    }

    let netPriceTotal = 0;
    const bookingPriceTotal = counters.booking.count * counters.booking.price;
    for (const [key, value] of Object.entries(counters)) {
      if (value.count) {
        if (key !== "booking") netPriceTotal += value.count * value.price;
        doc.text(value.txt, SIDE_MARGIN);
        doc.moveUp();
        doc.text(`x${value.count}`, doc.page.width - SIDE_MARGIN - 200);
        doc.moveUp();
        doc.text(`${value.price} €`, doc.page.width - SIDE_MARGIN - 100);
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
    if (realPrice !== netPriceTotal + bookingPriceTotal)
      discount = netPriceTotal + bookingPriceTotal - realPrice;

    doc.moveDown();
    doc.fontSize(11);
    doc.text("", SIDE_MARGIN);
    const brText = `Broneerimistasu: ${bookingPriceTotal} €`;
    doc.text(brText, { align: "right" });
    const preText = `Laagritasu: ${netPriceTotal} €`;
    doc.text(preText, { align: "right" });
    const sumText = `Kogusumma: ${netPriceTotal + bookingPriceTotal} €`;
    doc.text(sumText, { align: "right" });

    if (discount) {
      doc.moveDown();

      const discountText = `Soodustus: ${discount} €`;
      doc.text(discountText, { align: "right" });
    }

    doc.text("", SIDE_MARGIN);
    doc.moveDown();
    doc.fontSize(12).font(FONT_PRIMARY_BOLD);
    doc.text(`Tasumisele kuulub: ${realPrice} €`, { align: "right" });

    // Camper names
    doc.moveDown(4).fontSize(11);
    doc.text("Selgitus", SIDE_MARGIN);
    doc.moveDown();
    doc.fontSize(10).font(FONT_PRIMARY);
    doc.text(`Makseteatis ${billNr}, `, { continued: true });
    let processedCampers = 0;
    for (let i = 0; i < campers.length; ++i) {
      if (!campers[i].isRegistered) continue;
      ++processedCampers;
      doc.text(`${campers[i].child.name} ${campers[i].shiftNr}v`, {
        continued: true,
      });
      if (processedCampers !== regCount) doc.text(", ", { continued: true });
    }

    // Footer
    addBillFooter(doc, oneThird);

    doc.save();
    doc.end();

    await new Promise<void>((resolve) => {
      writeStream.on("finish", () => {
        resolve();
      });
    });

    return billName;
  };

  public static getName = (child: Registration) => {
    const name = child.contactName.replace(/ /g, "_").toLowerCase();
    return `${child.billNr}.pdf`;
  };
}

export default BillBuilder;

const addBillFooter = (doc: PDFDocument, oneThird: number) => {
  doc
    .moveTo(SIDE_MARGIN, doc.page.height - 110)
    .lineTo(doc.page.width - SIDE_MARGIN, doc.page.height - 110)
    .stroke();
  doc.fontSize(9).font(FONT_PRIMARY);
  doc.text("", SIDE_MARGIN);

  doc
    .text(
      "Sõudebaasi tee 23, 13517 Tallinn",
      SIDE_MARGIN,
      doc.page.height - 70,
      {
        width: oneThird,
      }
    )
    .text("Reg nr. 80067875");
  doc
    .text(
      "info@merelaager.ee",
      SIDE_MARGIN + 5 + oneThird,
      doc.page.height - 70,
      {
        width: oneThird,
      }
    )
    .text("+372 5628 6586");
  doc
    .text(
      "Swedbank EE862200221011493003",
      SIDE_MARGIN + 10 + 2 * oneThird,
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
  doc.font(FONT_PRIMARY_BOLD);
  doc
    .text("MTÜ Noorte Mereklubi", SIDE_MARGIN, doc.page.height - 90, {
      width: oneThird,
    })
    .text("Kontakt", SIDE_MARGIN + 5 + oneThird, doc.page.height - 90, {
      width: oneThird * 2,
    })
    .text(
      "Arveldus",
      doc.page.width - SIDE_MARGIN - bankLength,
      doc.page.height - 90,
      {
        width: oneThird,
      }
    );

  return doc;
};
