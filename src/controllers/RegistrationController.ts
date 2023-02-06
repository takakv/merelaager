import dotenv from "dotenv";
import { Request } from "express";
import { Registration } from "../db/models/Registration";
import { Child } from "../db/models/Child";
import {
  PrintEntry,
  RegistrationEntry,
} from "../routes/Support Files/registrations";
import { ShiftData } from "../db/models/ShiftData";
import { StatusCodes } from "http-status-codes";

import { Permission } from "../db/models/Permission";
import Entity = Express.Entity;
import { Op } from "sequelize";
import {
  permissionsList,
  tempPermissionsList,
} from "../utilities/permissionsList";
import AccessController, { shiftPermissions } from "./AccessController";
import { RegIdError } from "../routes/Support Files/Errors/errors";
import HttpError from "../routes/Support Files/Errors/HttpError";
import PermReg, { PermEdit } from "../utilities/acl/PermReg";
import BillBuilder from "./billGenerator";
import { generatePDF } from "./listGenerator";
import GlobalStore from "../utilities/GlobalStore";

dotenv.config();

class RegistrationController {
  /**
   * Fetches all registrations the user has view access to.
   * @param {Entity} user - The requesting user
   * @returns {RegistrationEntry[]} A list of all viewable registration entries
   */
  static fetchRegistrations = async (user: Entity) => {
    const userShiftPermissions =
      await AccessController.getPrefixedPermissionsForAllShifts(
        user.id,
        tempPermissionsList.registration.view.PN
      );

    const registrations: RegistrationEntry[] = [];

    if (!userShiftPermissions.length) return registrations;

    const camperRegistrations = await Registration.findAll({
      order: [["regOrder", "ASC"]],
      include: Child,
      where: {
        [Op.or]: userShiftPermissions.map((entry) => ({
          ["shiftNr"]: entry.shiftNr,
        })),
      },
    });

    if (!camperRegistrations.length) return registrations;

    camperRegistrations.forEach((registration) => {
      const entry = this.prepareRegistrationEntry(
        registration,
        userShiftPermissions.find(
          (entry: shiftPermissions) => registration.shiftNr === entry.shiftNr
        ).permissions
      );
      registrations.push(entry);
    });

    return registrations;
  };

  /**
   * Fetches a registration based on its identifier.
   * @param {Entity} user - The requesting user
   * @param {number} regId - The registration identifier
   * @returns The registration entries
   */
  static fetchRegistration = async (
    user: Entity,
    regId: number
  ): Promise<RegistrationEntry | HttpError> => {
    if (isNaN(regId)) return new RegIdError(StatusCodes.BAD_REQUEST);

    const registration = await Registration.findByPk(regId, {
      include: Child,
    });
    if (!registration) return new RegIdError(StatusCodes.NOT_FOUND);

    const userPermissions =
      await AccessController.getPrefixedPermissionsForShift(
        user.id,
        registration.shiftNr,
        PermReg.getView()
      );

    if (userPermissions === null) {
      return new HttpError(
        StatusCodes.FORBIDDEN,
        "Insufficient rights to view registration"
      );
    }

    return this.prepareRegistrationEntry(registration, userPermissions);
  };

  /**
   * Deletes a registration based on its identifier.
   * @param {Entity} user - The requesting user
   * @param {number} regId - The registration identifier
   * @returns `null` in case of a successful deletion
   */
  static deleteRegistration = async (
    user: Entity,
    regId: number
  ): Promise<null | HttpError> => {
    if (isNaN(regId)) return new RegIdError(StatusCodes.BAD_REQUEST);

    // Fetch first to check for permissions.
    const registration = await Registration.findByPk(regId);
    if (!registration) return new RegIdError(StatusCodes.NOT_FOUND);

    const deletionAllowed = await AccessController.approvePermission(
      user.id,
      registration.shiftNr,
      permissionsList.reg.edit.permissionName,
      permissionsList.reg.edit.delete
    );

    if (!deletionAllowed)
      return new HttpError(
        StatusCodes.FORBIDDEN,
        "Insufficient rights to delete registration"
      );

    try {
      await registration.destroy();
    } catch (e) {
      console.error(e);
      return new HttpError(StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return null;
  };

  /**
   * Generates a PDF list of registrations for a shift.
   * @param {Entity} user - The requesting user
   * @param {number} shiftNr - The identifier of the requested shift
   * @returns The name of the PDF file on the filesystem
   */
  static printShiftRegistrationsList = async (
    user: Entity,
    shiftNr: number
  ): Promise<string | HttpError> => {
    if (isNaN(shiftNr)) {
      return new HttpError(
        StatusCodes.BAD_REQUEST,
        "Shift number malformed or missing"
      );
    }

    const userPermissions =
      await AccessController.getPrefixedPermissionsForShift(
        user.id,
        shiftNr,
        tempPermissionsList.registration.view.PN
      );

    if (
      !this.findPermission(
        userPermissions,
        tempPermissionsList.registration.view.contact.PN
      )
    ) {
      return new HttpError(
        StatusCodes.FORBIDDEN,
        "Insufficient rights to view registrations"
      );
    }

    const registrations = await Registration.findAll({
      where: { shiftNr, isRegistered: true },
      include: { model: Child, order: [["name", "ASC"]] },
    });

    if (!registrations) {
      return new HttpError(StatusCodes.NOT_FOUND, "No registrations found");
    }

    const entries: PrintEntry[] = [];

    registrations.forEach((registration) => {
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

    return generatePDF(shiftNr, entries);
  };

  public static patchRegistration = async (
    req: Request,
    regId: number
  ): Promise<number | HttpError> => {
    if (isNaN(regId)) {
      return new HttpError(
        StatusCodes.BAD_REQUEST,
        "Registration identifier malformed or missing"
      );
    }

    // Fetch first to check for permissions.
    const registration = await Registration.findByPk(regId);
    if (!registration) {
      return new HttpError(StatusCodes.NOT_FOUND, "No registration found");
    }

    const body = req.body as {
      registered?: boolean;
      old?: boolean;
      pricePaid?: number;
      priceToPay?: number;
    };

    const approvePermission = async (extent: number) => {
      return AccessController.approvePermission(
        req.user.id,
        registration.shiftNr,
        PermReg.getEdit(),
        extent
      );
    };

    for (const key of Object.keys(body)) {
      switch (key) {
        case "registered":
          if (!(await approvePermission(PermEdit.FULL)))
            return new HttpError(StatusCodes.FORBIDDEN, "Insufficient rights");

          if (body.registered) {
            const { gender } = await registration.$get("child", {
              attributes: ["gender"],
            });
            const regCount = await Registration.count({
              where: {
                shiftNr: registration.shiftNr,
                isRegistered: true,
              },
              include: {
                model: Child,
                where: { gender },
              },
            });
            if (regCount >= 18)
              return new HttpError(
                StatusCodes.FORBIDDEN,
                "Registration count exceeds open slots"
              );
          }

          registration.isRegistered = body.registered;
          await this.updateData(registration);
          break;
        case "old":
          if (!(await approvePermission(PermEdit.FULL)))
            return new HttpError(StatusCodes.FORBIDDEN, "Insufficient rights");

          registration.isOld = body.old;
          break;
        case "pricePaid":
          if (!(await approvePermission(PermEdit.PRICE)))
            return new HttpError(StatusCodes.FORBIDDEN, "Insufficient rights");

          if (isNaN(body.pricePaid))
            return new HttpError(
              StatusCodes.BAD_REQUEST,
              "Price is not a number"
            );

          registration.pricePaid = body.pricePaid;
          break;
        case "priceToPay":
          if (!(await approvePermission(PermEdit.PRICE)))
            return new HttpError(StatusCodes.FORBIDDEN, "Insufficient rights");

          if (isNaN(body.priceToPay))
            return new HttpError(
              StatusCodes.BAD_REQUEST,
              "Price is not a number"
            );

          registration.priceToPay = body.priceToPay;
          break;
        default:
          return new HttpError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            `Unknown field '${key}'`
          );
      }
    }

    try {
      await registration.save();
    } catch (e) {
      console.error(e);
      return new HttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Unexpected error"
      );
    }
    return StatusCodes.NO_CONTENT;
  };

  public static sendConfirmationEmail = async (
    user: Entity,
    shiftNr: number
  ) => {
    // Fetch all registered campers.
    const tmp = await Registration.findAll({
      where: {
        shiftNr,
        isRegistered: true,
        notifSent: false,
      },
      attributes: ["contactEmail"],
    });

    const emails: string[] = [];
    for (const t of tmp) {
      if (emails.includes(t.contactEmail)) continue;
      emails.push(t.contactEmail);
    }

    for (const email of emails) {
      const campers = await Registration.findAll({
        where: { contactEmail: email },
        include: Child,
      });

      const regCampers: Registration[] = [];
      const resCampers: Registration[] = [];

      const shifts: number[] = [];
      let totalPrice = 0;

      const tmpBillNr = GlobalStore.billNumber;
      ++GlobalStore.billNumber;

      let skipLoop = false;

      for (const camper of campers) {
        if (camper.isRegistered) {
          regCampers.push(camper);
          totalPrice += camper.priceToPay;

          // Only mark registered campers as notified.
          // As such, if another household member is subsequently registered
          // a new bill can be sent for them.
          camper.notifSent = true;
        } else resCampers.push(camper);

        if (!shifts.includes(camper.shiftNr)) shifts.push(camper.shiftNr);

        camper.billNr = tmpBillNr;
        try {
          await camper.save();
        } catch (e) {
          console.log(e);
          skipLoop = true;
          break;
        }
      }

      if (skipLoop) continue;

      const contact = {
        name: campers[0].contactName,
        email: campers[0].contactEmail,
      };

      const billName = await BillBuilder.generatePdf(
        regCampers,
        contact,
        tmpBillNr,
        regCampers.length
      );

      await GlobalStore.mailService.sendConfirmationMail(
        contact,
        regCampers,
        resCampers,
        shifts,
        totalPrice,
        billName,
        tmpBillNr
      );
    }
  };

  private static updateData = async (registration: Registration) => {
    const { shiftNr } = registration;

    const child = await Child.findOne({
      where: { id: registration.childId },
    });

    const [entry, created] = await ShiftData.findOrCreate({
      where: { childId: child.id, shiftNr },
      defaults: {
        childId: child.id,
        shiftNr,
        parentNotes: registration.addendum,
        isActive: registration.isRegistered,
      },
    });

    if (!created) {
      entry.isActive = registration.isRegistered;
      await entry.save();
    }
  };

  /**
   * Selects the registration information fields according to the viewing permissions of the requesting user.
   * @param {Registration} data - The registration entry
   * @param {Permission[]} permissions - The sorted list of view permissions
   * @returns {RegistrationEntry} The prepared entry
   */
  private static prepareRegistrationEntry = (
    data: Registration,
    permissions: Permission[]
  ): RegistrationEntry => {
    const entry: RegistrationEntry = {
      id: data.id,
      name: data.child.name,
      gender: data.child.gender,
      dob: data.birthday,
      old: data.isOld,
      shiftNr: data.shiftNr,
      shirtSize: data.tsSize,
      order: data.regOrder,
      registered: data.isRegistered,
    };

    if (
      this.findPermission(
        permissions,
        tempPermissionsList.registration.view.contact.PN
      )
    ) {
      entry.contactName = data.contactName;
      entry.contactEmail = data.contactEmail;
      entry.contactPhone = data.contactNumber;
    }

    if (
      this.findPermission(
        permissions,
        tempPermissionsList.registration.view.price.PN
      )
    ) {
      entry.billNr = data.billNr;
      entry.pricePaid = data.pricePaid;
      entry.priceToPay = data.priceToPay;
    }
    return entry;
  };

  /**
   * Finds a permission in a list of permissions.
   * @param {Permission[]} permissions - The array of permissions
   * @param {string} permissionName - The prefixed name of the permission to find
   * @returns {boolean} `true` if found, `false` otherwise
   */
  private static findPermission = (
    permissions: Permission[],
    permissionName: string
  ): boolean => {
    if (!Array.isArray(permissions)) return false;
    return (
      permissions.find(
        (permission: Permission) => permission.name === permissionName
      ) !== undefined
    );
  };
}

export default RegistrationController;
