const PDFDoc = require("pdfkit");
const fs = require("fs");

const shiftData = JSON.parse(fs.readFileSync("./data/shiftdata.json", "utf-8"));

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

exports.getName = (child) => {
  const name = child.contactName.replace(/ /g, "_").toLowerCase();
  return `arve_${name}.pdf`;
};

exports.generatePDF = async (campers, billNr, regCampers) => {
  const name = campers[0].contactName.replace(/ /g, "_").toLowerCase();
  let doc = new PDFDoc(billMeta);

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
    .text(campers[0].contactName, sideMargin, contentTop);
  doc.fontSize(11).font("Helvetica").text(campers[0].contactEmail);

  const firstShift = campers[0].shift;
  const deadline = shiftData[firstShift]["deadline"];

  // Bill details
  const billTop = contentTop + 80;

  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + 4);

  const billDate = today.toLocaleDateString("et").replace(/\//g, ".");
  const billDue = due.toLocaleDateString("et").replace(/\//g, ".");

  const billNrLength = doc.widthOfString(`${billNr}`);
  const billDateLength = doc.widthOfString(billDate);
  const billDueLength = doc.widthOfString(billDue);
  const billFinalLength = doc.widthOfString(deadline);

  const billDataRightOffset = 310;

  doc
    .text("Makseteatise number:", sideMargin, billTop)
    .text("Makseteatise kuupäev:")
    .text("Broneerimistasu maksetähtaeg:")
    .text("Laagritasu maksetähtaeg:");
  doc
    .font("Helvetica-Bold")
    .text(
      `${billNr}`,
      doc.page.width - billDataRightOffset - billNrLength,
      billTop
    )
    .font("Helvetica")
    .text(billDate, doc.page.width - billDataRightOffset - billDateLength)
    .text(billDue, doc.page.width - billDataRightOffset - billDueLength)
    .text(deadline, doc.page.width - billDataRightOffset - billFinalLength);
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
    if (!campers[i].isRegistered) continue;
    if (campers[i].shift === "1v") {
      if (campers[i].city.toLowerCase().trim() === "tallinn")
        ++counters.sv1.count;
      else if (campers[i].isOld) ++counters.sv2.count;
      else ++counters.sv3.count;
    } else {
      if (campers[i].city.toLowerCase().trim() === "tallinn")
        ++counters.lv1.count;
      else if (campers[i].isOld) ++counters.lv2.count;
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
  const sumText = `Kogusumma: ${prePrice + brPrice} €`;
  doc.text(sumText, { align: "right" });

  doc.text("", sideMargin);
  doc.moveDown();
  doc.fontSize(12).font("Helvetica-Bold");
  doc.text(`Tasumisele kuulub: ${prePrice + brPrice} €`, { align: "right" });

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
    doc.text(
      `${campers[i].name} ${shiftData[campers[i].shift].id.slice(0, 4)}`,
      {
        continued: true,
      }
    );
    if (processedCampers !== regCampers) doc.text(", ", { continued: true });
  }

  // Footer
  generateFooter(doc, oneThird);

  doc.save();
  doc.end();

  await new Promise((fulfill) => writeStream.on("finish", fulfill));
  return `arve_${name}.pdf`;
};

const generateFooter = (doc, oneThird) => {
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
