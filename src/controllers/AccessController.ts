import { User } from "../db/models/User";
import { ShiftGroup } from "../db/models/ShiftGroup";
import { ACGroup } from "../db/models/ACGroup";
import { Permission } from "../db/models/Permission";
import { Op } from "sequelize";

export type shiftPermissions = {
  shiftNr: number;
  permissions: Permission[];
};

class AccessController {
  /**
   * Selects all permissions (with a certain prefix) of a user for all shifts. Shifts
   * themselves are sorted in ascending order.
   * @param userId - The user identifier
   * @param permissionPrefix - The prefix of the permission (e.g., registration.view)
   * @returns {Promise<shiftPermissions[]>} The list of permissions
   */
  public static getPrefixedPermissionsForAllShifts = async (
    userId: number,
    permissionPrefix: string
  ) => {
    const userData = await User.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: ShiftGroup,
          required: true,
          attributes: ["shiftNr"],
          order: ["shiftNr", "ASC"],
          include: [this.getACGroup(permissionPrefix)],
        },
      ],
    });

    if (!userData) return [] as shiftPermissions[];

    const permissions: shiftPermissions[] = userData.shiftGroups.map(
      (shift: ShiftGroup) => ({
        shiftNr: shift.shiftNr,
        permissions: shift.acGroup.permissions,
      })
    );

    return permissions;
  };

  /**
   * Selects all permissions (with a certain prefix) of a user for a specific shift.
   * @param userId - The user identifier
   * @param shiftNr - The shift's identifier
   * @param permissionPrefix - The prefix of the permission (e.g., registration.view)
   * @returns {Promise<Permissions[]} The list of permissions
   */
  public static getPrefixedPermissionsForShift = async (
    userId: number,
    shiftNr: number,
    permissionPrefix: string
  ): Promise<Permission[]> => {
    const userData = await User.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: ShiftGroup,
          required: true,
          attributes: ["shiftNr"],
          where: { shiftNr },
          include: [this.getACGroup(permissionPrefix)],
        },
      ],
    });

    if (!userData) return [] as Permission[];

    if (userData.shiftGroups.length !== 1) {
      console.log("Malformed shift groups");
      console.log(userData.shiftGroups);
      return [] as Permission[];
    }

    return userData.shiftGroups[0].acGroup.permissions;
  };

  /**
   * Approves or denies the requested permission for a given user and a given shift.
   * @param userId - The user identifier
   * @param shiftNr - The shift's identifier
   * @param permissionType - The name/type of the permission
   * @param permissionExtent - The extent of the permission
   * @returns {boolean} `true` if approved, else `false`
   */
  public static approvePermission = async (
    userId: number,
    shiftNr: number,
    permissionType: string,
    permissionExtent: number
  ) => {
    const userData = await User.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: ShiftGroup,
          required: true,
          attributes: ["shiftNr"],
          where: { shiftNr },
          include: [this.getPermission(permissionType, permissionExtent)],
        },
      ],
    });

    return !!userData;
  };

  private static getPermission = (type: string, extent: number) => {
    return {
      model: ACGroup,
      attributes: ["id"],
      required: true,
      include: [
        {
          model: Permission,
          attributes: ["name", "extent"],
          where: {
            name: type,
            extent: extent,
          },
        },
      ],
    };
  };

  private static getACGroup = (permissionPrefix: string) => {
    return {
      model: ACGroup,
      attributes: ["id"],
      required: true,
      include: [
        {
          model: Permission,
          attributes: ["name"],
          where: {
            name: {
              [Op.startsWith]: permissionPrefix,
            },
          },
        },
      ],
    };
  };
}

export default AccessController;
