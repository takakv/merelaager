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
   * @param permissionName - The name of the view permission
   * @returns {Promise<shiftViewPermission[]>} The sorted list of sorted permissions
   */
  static getViewPermissionsForAllShifts = async (
    userId: number,
    permissionName: string
  ) => {
    const userData = await User.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: ShiftGroup,
          required: true,
          attributes: ["shiftNr"],
          order: ["shiftNr", "ASC"],
          include: [
            {
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
            },
          ],
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

  static #sortPermissionsDescending = (a: Permission, b: Permission) =>
    b.extent - a.extent;
}

export default AccessController;
