import { StatusCodes } from "http-status-codes";
import { Permission } from "../db/models/Permission";
import { Role } from "../db/models/Role";
import PermGroups from "../utilities/acl/PermGroups";
import { RolePermission } from "../db/models/RolePermission";
import { tempPermissionsList } from "../utilities/permissionsList";

export type ACRequest = {
  name: string;
};

type DBEntry = {
  name: string;
  id: number;
};

class PermissionController {
  public static initDB = async () => {
    const groups = await this.initGroups();
    const perms = await this.initPermissions();
    await this.tiePermissions(groups, perms);
    return StatusCodes.CREATED;
  };

  private static initGroups = async () => {
    const groups: DBEntry[] = [
      { name: PermGroups.ROOT, id: 0 },
      { name: PermGroups.BOSS, id: 0 },
      { name: PermGroups.COACH, id: 0 },
      { name: PermGroups.HELPER, id: 0 },
    ];

    for (const [idx, group] of groups.entries()) {
      const [tmp] = await Role.findOrCreate({
        where: { name: group.name },
      });
      groups[idx].id = tmp.getDataValue("id");
    }

    return groups;
  };

  private static initPermissions = async () => {
    const perms: DBEntry[] = [];

    const traverseAndAdd = (obj: object | string) => {
      if (obj === null) return;

      if (typeof obj === "string") {
        // We don't want topmost nodes (i.e., nodes without a dot).
        if ((obj.match(/\./g) || []).length < 1) return;

        perms.push({
          name: obj,
          id: 0,
        });

        return;
      }

      for (const [, value] of Object.entries(obj)) {
        traverseAndAdd(value as object | string);
      }
    };

    // Identify permissions for creation.
    traverseAndAdd(tempPermissionsList);

    // Create the permissions in DB.
    for (const [idx, perm] of perms.entries()) {
      const [tmp] = await Permission.findOrCreate({
        where: { name: perm.name },
      });
      perms[idx].id = tmp.getDataValue("id");
    }

    return perms;
  };

  private static findPermId = (perms: DBEntry[], permName: string): number => {
    const entry = perms.find((perm) => perm.name === permName);
    if (entry === undefined) return -1;
    return entry.id;
  };

  private static tiePermissions = async (
    groups: DBEntry[],
    perms: DBEntry[]
  ) => {
    const setInDB = async (groupId: number, permissionName: string) => {
      await RolePermission.findOrCreate({
        where: {
          groupId,
          permissionId: this.findPermId(perms, permissionName),
        },
      });
    };

    for (const group of groups) {
      // More powerful roles inherit permissions from lower roles.
      switch (group.name) {
        case PermGroups.ROOT:
          // View permissions
          await setInDB(
            group.id,
            tempPermissionsList.registration.view.idCode.PN
          );
          // Edit permissions
          await setInDB(
            group.id,
            tempPermissionsList.registration.edit.price.PN
          );
        // falls through
        case PermGroups.BOSS:
          // View permissions
          await setInDB(
            group.id,
            tempPermissionsList.registration.view.address.PN
          );
          await setInDB(
            group.id,
            tempPermissionsList.registration.view.price.PN
          );
          // Edit permissions
          await setInDB(
            group.id,
            tempPermissionsList.registration.edit.isRegistered.PN
          );
          await setInDB(
            group.id,
            tempPermissionsList.registration.edit.isOld.PN
          );
          // Delete permissions
          await setInDB(group.id, tempPermissionsList.registration.delete.PN);
        // falls through
        case PermGroups.COACH:
          await setInDB(
            group.id,
            tempPermissionsList.registration.view.contact.PN
          );
        // falls through
        case PermGroups.HELPER:
          await setInDB(
            group.id,
            tempPermissionsList.registration.view.basic.PN
          );
          break;
      }
    }
  };
}

export default PermissionController;

export const createPermission = async (data: ACRequest) => {
  const { name } = data;

  try {
    const [, created] = await Permission.findOrCreate({
      where: { name },
    });
    if (created) return StatusCodes.CREATED;
    return StatusCodes.NOT_MODIFIED;
  } catch (e) {
    console.error(e);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

export const createACGroup = async (data: ACRequest) => {
  const { name } = data;

  try {
    const [, created] = await Role.findOrCreate({
      where: { name },
    });
    if (created) return StatusCodes.CREATED;
    return StatusCodes.NOT_MODIFIED;
  } catch (e) {
    console.error(e);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
};
