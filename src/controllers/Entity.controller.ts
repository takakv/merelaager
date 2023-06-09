import { Op } from "sequelize";

import { User } from "../db/models/User";
import { UserShiftRole } from "../db/models/UserShiftRole";
import { Role } from "../db/models/Role";
import { Permission } from "../db/models/Permission";

class EntityController {
  static hasViewAccess = async (
    userId: number,
    shiftId: number,
    resourceType: string,
    extent: string
  ): Promise<boolean> => {
    const permissionName = resourceType + "view" + extent;

    const user = await User.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: UserShiftRole,
          required: true,
          attributes: ["shiftNr"],
          where: { shiftNr: shiftId },
          include: [this.getACGroupQueryObject(permissionName)],
        },
      ],
    });

    return !!user;
  };

  /**
   * Selects permissions of a user for a specific resource, depending on the
   * shift and the resource access type.
   * @param userId - The user's identifier
   * @param shiftId - The shift's identifier
   * @param resourceType - The type of resource to access (e.g., registration)
   * @param accessType - The resource access type (e.g., view)
   * @returns The list of permissions
   */
  static getResourceShiftPermissions = async (
    userId: number,
    shiftId: number,
    resourceType: string,
    accessType: string
  ): Promise<Permission[]> => {
    const permissionPrefix = resourceType + accessType;

    const user = await User.findByPk(userId, {
      attributes: [],
      include: [
        {
          model: UserShiftRole,
          required: true,
          attributes: ["shiftNr"],
          where: { shiftNr: shiftId },
          include: [this.getACGroupQueryObject(permissionPrefix)],
        },
      ],
    });

    // We have queried permissions for a single shift.
    if (!user || user.shiftGroups.length !== 1) return [] as Permission[];

    return user.shiftGroups[0].acGroup.permissions;
  };

  private static getACGroupQueryObject = (permissionName: string) => {
    return {
      model: Role,
      attributes: ["id"],
      required: true,
      include: [
        {
          model: Permission,
          attributes: ["name"],
          where: {
            name: { [Op.startsWith]: permissionName },
          },
        },
      ],
    };
  };

  private static getPermissionId = async (
    permissionName: string
  ): Promise<number> => {
    const permission = await Permission.findOne({
      where: { name: permissionName },
      attributes: ["id"],
      rejectOnEmpty: true,
    });

    return permission.id;
  };
}

export default EntityController;
