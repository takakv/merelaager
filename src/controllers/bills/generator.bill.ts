import fs from "fs";
import PDFDoc from "pdfkit";
import PDFDocumentOptions = PDFKit.PDFDocumentOptions;

const SIDE_MARGIN = 60;
const CONTENT_TOP = 60;
const CONTENT_BOTTOM = 40;
const LOGO_WIDTH = 60;

const FONT_PRIMARY = "Helvetica";
const FONT_PRIMARY_BOLD = "Helvetica-Bold";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "2-digit",
  day: "2-digit",
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

type Contact = {
  name: string;
  email: string;
};

type InvoiceItems = {
  description: string;
  quantity: number;
  price: number;
};

const generateBill = async (
  billNr: number,
  dueDays: number,
  contact: Contact,
  items: InvoiceItems
): Promise<string> => {
  const billName = "testbill.pdf";

  const doc = new PDFDoc(BILL_META);
  const writeStream = fs.createWriteStream(`./data/arved/${billName}`);

  const oneThird = (doc.page.width - SIDE_MARGIN * 2 - 10) / 3;

  doc.pipe(writeStream);

  // Logo
  doc.image(
    "./media/files/bluelogo.png",
    doc.page.width - SIDE_MARGIN * 2,
    CONTENT_TOP / 2,
    { width: LOGO_WIDTH }
  );

  // Recipient's name
  doc
    .fontSize(22)
    .font(FONT_PRIMARY_BOLD)
    .text(contact.name, SIDE_MARGIN, CONTENT_TOP);
  doc.fontSize(11).font(FONT_PRIMARY).text(contact.email);

  // Bill details
  const billTop = CONTENT_TOP + 80;

  const genesisDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(genesisDate.getDate() + dueDays);

  const strGenesisDate = genesisDate.toLocaleDateString("et", DATE_OPTIONS);
  const strDueDate = dueDate.toLocaleDateString("et", DATE_OPTIONS);

  const billNrLength = doc.widthOfString(`${billNr}`);
  const genesisDateLength = doc.widthOfString(strGenesisDate);
  const dueDateLength = doc.widthOfString(strDueDate);

  const billDataRightOffset = 310;

  doc
    .text("Makseteatise number:", SIDE_MARGIN, billTop)
    .text("Makseteatise kuupäev:")
    .text("Maksetähtaeg:");

  doc
    .font(FONT_PRIMARY_BOLD)
    .text(
      `${billNr}`,
      doc.page.width - billDataRightOffset - billNrLength,
      billTop
    )
    .font(FONT_PRIMARY)
    .text(
      strGenesisDate,
      doc.page.width - billDataRightOffset - genesisDateLength
    )
    .text(strDueDate, doc.page.width - billDataRightOffset - dueDateLength);

  await new Promise<void>((resolve) => {
    writeStream.on("finish", () => {
      resolve();
    });
  });

  return billName;
};
