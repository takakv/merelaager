import fs from "fs";
import PDFDoc from "pdfkit";
import QRCode from "qrcode";

const cardMeta = {
  size: "A4",
  info: {
    Title: "Usalduslikud andmed",
    Author: "e-kambüüs",
  },
  margins: {
    top: 60,
    left: 60,
    right: 60,
    bottom: 40,
  },
  autoFirstPage: true,
};

const populateCard = async (doc, camper) => {
  const birthday = new Date(camper.birthday);
  let now = Date.now();
  // now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const age = Math.floor(
    (now - birthday.getTime()) / (60 * 60 * 24 * 365 * 1000)
  );

  doc.font("Helvetica-Bold").text(camper.name);
  doc
    .font("Helvetica")
    .moveDown()
    .text("Sugu: " + camper.gender)
    .moveDown()
    .text(
      "Sünnipäev: " +
        birthday.toLocaleDateString("et") +
        ", vanus: " +
        age +
        "a"
    )
    .moveDown()
    .text("Vana olija: " + (camper.isOld ? "jah" : "ei"))
    .moveDown()
    .text("Särgi suurus: " + camper.tsSize)
    .moveDown(2);
  doc.font("Helvetica-Bold").text("Kontakt");
  doc
    .font("Helvetica")
    .moveDown()
    .text(camper.contactName + ", " + camper.contactNumber)
    .text(camper.contactEmail)
    .moveDown()
    .text("Varu tel: " + (camper.backupTel ? camper.backupTel : "-"))
    .moveDown()
    .text(
      camper.contactName +
        " kinnitab, et on läbi lugenud ja nõustub laagri kodukorraga."
    )
    .moveDown(2);
  doc.font("Helvetica-Bold").text("Aadress");
  doc
    .font("Helvetica")
    .moveDown()
    .text(camper.road + ", " + camper.city)
    .text(camper.county + ", " + camper.country)
    .moveDown(2);
  doc.font("Helvetica-Bold").text("Lisainfo");
  doc.font("Helvetica").moveDown().text(camper.addendum);

  const telUrl = await new Promise((resolve, reject) => {
    QRCode.toDataURL(
      `tel:${camper.contactNumber}`,
      { version: 3 },
      (err, url) => (err != null ? reject(err) : resolve(url))
    );
  });

  const mailUrl = await new Promise((resolve, reject) => {
    QRCode.toDataURL(
      `mailto:${camper.contactEmail}`,
      { version: 3 },
      (err, url) => (err != null ? reject(err) : resolve(url))
    );
  });

  const sideMargin = 60;
  const contentTop = 60;
  const rightSide = doc.page.width - sideMargin;

  doc
    .image(telUrl, rightSide - 2 * 100 - 20, contentTop + 10, { width: 100 })
    .text("Telefon", rightSide - 2 * 100 - 10, contentTop);
  doc
    .image(mailUrl, rightSide - 100, contentTop + 10, { width: 100 })
    .text("Meil", rightSide - 100 + 10, contentTop);
};

exports.generateOneCard = async (shiftNr, camper) => {
  const docName = `andmed_${camper.id}_${shiftNr}v.pdf`;
  cardMeta.autoFirstPage = true;

  let doc = new PDFDoc(cardMeta);
  const writeStream = fs.createWriteStream(`./data/files/${docName}`);

  doc.pipe(writeStream);
  await populateCard(doc, camper);
  doc.save();
  doc.end();

  await new Promise((fulfill) => writeStream.on("finish", fulfill));

  return docName;
};

exports.generateAllCards = async (shiftNr, campers) => {
  const docName = `andmed_${shiftNr}v.pdf`;
  cardMeta.autoFirstPage = false;

  let doc = new PDFDoc(cardMeta);
  const writeStream = fs.createWriteStream(`./data/files/${docName}`);

  doc.pipe(writeStream);

  for (const camper of campers) {
    doc.addPage();
    await populateCard(doc, camper);
  }

  doc.save();
  doc.end();

  await new Promise((fulfill) => writeStream.on("finish", fulfill));

  return docName;
};
