import * as fs from "fs";
import { WriteStream } from "fs";

import { Response } from "express";
import { ValidatedRequest } from "express-joi-validation";
import { StatusCodes } from "http-status-codes";
import PdfPrinter from "pdfmake";

import {
  BufferOptions,
  TDocumentDefinitions,
  TFontDictionary,
} from "pdfmake/interfaces";

import { ShiftRegistrationRequestSchema } from "./registration.types";
import Constants from "../../utils/constants";
import { approvePm } from "../../utils/permissionValidator";
import { PrintEntry } from "../../routes/Support Files/registrations";

import { Permission } from "../../db/models/Permission";
import { Role } from "../../db/models/Role";
import { Registration } from "../../db/models/Registration";
import { Child } from "../../db/models/Child";
import Entity = Express.Entity;
import PDFDocument = PDFKit.PDFDocument;

const createDoc = (
  shiftNr: number,
  entries: PrintEntry[]
): TDocumentDefinitions => {
  const tableHeaders: string[] = [
    "Nimi",
    "Sugu",
    "Sünnipäev",
    "Uus?",
    "Särk",
    "Kontakt",
    "Number",
    "Meil",
  ];
  const tableRows: string[][] = [tableHeaders];
  entries.forEach((entry: PrintEntry) => {
    tableRows.push([
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
      { table: { body: tableRows } },
    ],
    defaultStyle: { font: "Helvetica" },
    pageOrientation: "landscape",
  };
};

export const generateShiftCamperListPDF = async (
  shiftNr: number,
  entries: PrintEntry[]
): Promise<string> => {
  const filename = `${shiftNr}v_nimekiri.pdf`;
  const options: BufferOptions = {};
  const fonts: TFontDictionary = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer: PdfPrinter = new PdfPrinter(fonts);

  try {
    // PDF document
    const pdfDoc: PDFDocument = printer.createPdfKitDocument(
      createDoc(shiftNr, entries),
      options
    );

    // PDF output
    const writeStream: WriteStream = fs.createWriteStream(
      `data/files/${filename}`
    );

    // Write the document to file.
    pdfDoc.pipe(writeStream);
    pdfDoc.end();

    // Emulate async behaviour in async/await syntax.
    await new Promise((fulfill) => writeStream.on("finish", fulfill));

    // Return the filename of the PDF.
    return filename;
  } catch (e) {
    console.error(e);

    // On error, return an empty filename.
    return "";
  }
};

/**
 * Fetch the PDF list of registrations for a given shift.
 * @param req
 * @param res
 */
export const fetchShiftRegistrationsPdfFunc = async (
  req: ValidatedRequest<ShiftRegistrationRequestSchema>,
  res: Response
): Promise<void> => {
  const user: Entity = req.user;
  const shiftNr: number = req.params.shiftNr;

  // User has no role for this shift.
  if (!user.shiftRoles.hasOwnProperty(shiftNr)) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  const permissions: Permission[] = await Permission.findAll({
    attributes: ["permissionName"],
    include: {
      model: Role,
      where: { id: user.shiftRoles[shiftNr] },
    },
  });

  const hasViewPerms: boolean =
    approvePm(permissions, Constants.PERMISSION_VIEW_REG_BASIC) &&
    approvePm(permissions, Constants.PERMISSION_VIEW_REG_CONTACT);

  if (
    !hasViewPerms &&
    !approvePm(permissions, Constants.PERMISSION_VIEW_REG_FULL)
  ) {
    res.sendStatus(StatusCodes.FORBIDDEN);
    return;
  }

  const dbRegistrations: Registration[] = await Registration.findAll({
    where: { shiftNr, isRegistered: true },
    include: { model: Child, order: [["name", "ASC"]] },
  });

  if (!dbRegistrations) {
    res.sendStatus(StatusCodes.NOT_FOUND);
    return;
  }

  const entries: PrintEntry[] = [];

  dbRegistrations.forEach((registration: Registration) => {
    entries.push({
      name: registration.child.name,
      gender: registration.child.gender,
      dob: registration.birthday,
      old: registration.isOld,
      shirtSize: registration.tsSize,
      contactName: registration.contactName.trim(),
      contactEmail: registration.contactEmail.trim(),
      contactNumber: registration.contactNumber.trim(),
    });
  });

  const pdfName: string = await generateShiftCamperListPDF(shiftNr, entries);
  if (!pdfName) {
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    return;
  }

  res.sendFile(pdfName, { root: "./data/files" });
};
