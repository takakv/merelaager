import { StatusCodes } from "http-status-codes";
import { Permission } from "../db/models/Permission";
import { ACGroup } from "../db/models/ACGroup";
import PermGroups from "../utilities/acl/PermGroups";
import PermReg, { PermEdit, PermView } from "../utilities/acl/PermReg";
import permGroups from "../utilities/acl/PermGroups";
import permReg from "../utilities/acl/PermReg";
import { GroupPermission } from "../db/models/GroupPermission";

export type acRequest = {
  name: string;
};

type GroupEntry = {
  name: string;
  id: number;
};

type PermEntry = {
  name: string;
  extent: number;
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
    const groups: GroupEntry[] = [
      { name: PermGroups.BOSS, id: 0 },
      { name: PermGroups.COACH, id: 0 },
      { name: PermGroups.HELPER, id: 0 },
    ];

    for (const [idx, group] of groups.entries()) {
      const [tmp] = await ACGroup.findOrCreate({
        where: { name: group.name },
      });
      groups[idx].id = tmp.getDataValue("id");
    }

    return groups;
  };

  private static initPermissions = async () => {
    const perms: PermEntry[] = [];

    for (const perm of PermReg.view) {
      perms.push({
        name: PermReg.getView(),
        extent: perm,
        id: 0,
      });
    }

    for (const perm of PermReg.edit) {
      perms.push({
        name: PermReg.getEdit(),
        extent: perm,
        id: 0,
      });
    }

    for (const [idx, perm] of perms.entries()) {
      const [tmp] = await Permission.findOrCreate({
        where: { name: perm.name, extent: perm.extent },
      });
      perms[idx].id = tmp.getDataValue("id");
    }

    return perms;
  };

  private static findPermId = (
    perms: PermEntry[],
    permName: string,
    permExtent: number
  ): number => {
    const entry = perms.find(
      (perm) => perm.name === permName && perm.extent == permExtent
    );
    if (entry === undefined) return -1;
    return entry.id;
  };

  private static tiePermissions = async (
    groups: GroupEntry[],
    perms: PermEntry[]
  ) => {
    for (const group of groups) {
      switch (group.name) {
        case PermGroups.BOSS:
          await GroupPermission.findOrCreate({
            where: {
              groupId: group.id,
              permissionId: this.findPermId(
                perms,
                PermReg.getView(),
                PermView.FULL
              ),
            },
          });
          await GroupPermission.findOrCreate({
            where: {
              groupId: group.id,
              permissionId: this.findPermId(
                perms,
                PermReg.getEdit(),
                PermEdit.FULL
              ),
            },
          });
          await GroupPermission.findOrCreate({
            where: {
              groupId: group.id,
              permissionId: this.findPermId(
                perms,
                PermReg.getEdit(),
                PermEdit.DELETE
              ),
            },
          });
          break;
        case PermGroups.COACH:
          break;
        case PermGroups.HELPER:
          break;
      }
    }
  };
}

export default PermissionController;

export const createPermission = async (data: acRequest) => {
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

export const createACGroup = async (data: acRequest) => {
  const { name } = data;

  try {
    const [, created] = await ACGroup.findOrCreate({
      where: { name },
    });
    if (created) return StatusCodes.CREATED;
    return StatusCodes.NOT_MODIFIED;
  } catch (e) {
    console.error(e);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
};
