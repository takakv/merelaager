import { PrintEntry } from "../routes/Support Files/registrations";

const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const PdfPrinter = require("pdfmake");
const printer = new PdfPrinter(fonts);
import * as fs from "fs";

const createDoc = (shiftNr: number, entries: PrintEntry[]) => {
  const tableContent = [
    ["Nimi", "Sugu", "Sünnipäev", "Uus?", "Särk", "Kontakt", "Number", "Meil"],
  ];
  entries.forEach((entry) => {
    tableContent.push([
      entry.name,
      entry.gender,
      new Date(entry.dob).toLocaleDateString("et-EE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      entry.old ? "" : "X",
      entry.shirtSize,
      entry.contactName,
      entry.contactNumber,
      entry.contactEmail,
    ]);
  });

  return {
    content: [
      { text: `${shiftNr}v ${new Date().getFullYear()}`, style: "header" },
      {
        table: {
          body: tableContent,
        },
      },
    ],
    defaultStyle: {
      font: "Helvetica",
    },
    pageOrientation: "landscape",
  };
};

const options = {};

exports.generatePDF = async (shiftNr: number, entries: PrintEntry[]) => {
  const filename = shiftNr + "v_nimekiri.pdf";
  try {
    const pdfDoc = printer.createPdfKitDocument(
      createDoc(shiftNr, entries),
      options
    );
    const writeStream = fs.createWriteStream(`data/files/${filename}`);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();
    await new Promise((fulfill) => writeStream.on("finish", fulfill));
    return filename;
  } catch (e) {
    console.error(e);
    return false;
  }
};
