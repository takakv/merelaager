import { User } from "../db/models/User";
import { ShiftGroup } from "../db/models/ShiftGroup";
import { ACGroup } from "../db/models/ACGroup";
import { Permission } from "../db/models/Permission";

type shiftViewPermission = {
  shiftNr: number;
  permissions: Permission[];
};

class AccessController {
  /**
   * Selects all view permissions of a user for all shifts. Permissions for each shift
   * are sorted in descending order, starting with the most "powerful" permission. Shifts
   * themselves are sorted in ascending order.
   * @param userId - The user identifier
   * @param permissionType - The type of the view permission
   * @returns {Promise<shiftViewPermission[]>} The sorted list of sorted permissions
   */
  static getViewPermissionsForAllShifts = async (
    userId: number,
    permissionType: string
  ) => {
    const userData = await User.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: ShiftGroup,
          required: true,
          attributes: ["shiftNr"],
          order: ["shiftNr", "ASC"],
          include: [this.#getACGroup(permissionType)],
        },
      ],
    });

    if (!userData) return [] as shiftViewPermission[];

    const permissions: shiftViewPermission[] = userData.shiftGroups.map(
      (shift) => ({
        shiftNr: shift.shiftNr,
        permissions: shift.acGroup.permissions.sort(
          this.#sortPermissionsDescending
        ),
      })
    );

    return permissions;
  };

  /**
   * Selects all view permissions of a user for a specific shift. Permissions
   * are sorted in descending order, starting with the most "powerful" permission.
   * @param userId - The user identifier
   * @param shiftNr - The shift's identifier
   * @param permissionType - The type of the view permission
   * @returns {Promise<Permissions[] | null>} The sorted permissions
   */
  static getViewPermissionsForShift = async (
    userId: number,
    shiftNr: number,
    permissionType: string
  ) => {
    const userData = await User.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: ShiftGroup,
          required: true,
          attributes: ["shiftNr"],
          where: { shiftNr },
          include: [this.#getACGroup(permissionType)],
        },
      ],
    });

    if (!userData) return null;

    if (userData.shiftGroups.length !== 1) {
      console.log("Malformed shift groups");
      return null;
    }

    return userData.shiftGroups[0].acGroup.permissions.sort(
      this.#sortPermissionsDescending
    );
  };

  static #getACGroup = (permissionName: string) => {
    return {
      model: ACGroup,
      attributes: ["id"],
      required: true,
      include: [
        {
          model: Permission,
          attributes: ["name", "extent"],
          where: {
            name: permissionName,
          },
        },
      ],
    };
  };

  static #sortPermissionsDescending = (a: Permission, b: Permission) =>
    b.extent - a.extent;
}

export default AccessController;
