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
const fs = require("fs");

const createDoc = (shiftNr, campers) => {
  const tableContent = [
    ["Nimi", "Sugu", "Sünnipäev", "Uus?", "Särk", "Kontakt", "Number", "Meil"],
  ];
  campers.forEach((camper) => {
    tableContent.push([
      camper.name,
      camper.gender,
      camper.birthday,
      camper.isOld ? "Ei" : "Jah",
      camper.tsSize,
      camper.contactName,
      camper.contactNr,
      camper.contactEmail,
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

exports.generatePDF = async (shiftNr, campers) => {
  const filename = shiftNr + "v_nimekiri.pdf";
  try {
    const pdfDoc = printer.createPdfKitDocument(
      createDoc(shiftNr, campers),
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
