import { StatusCodes } from "http-status-codes";
import { Permission } from "../db/models/Permission";
import { ACGroup } from "../db/models/ACGroup";
import PermGroups from "../utilities/acl/PermGroups";
import PermReg from "../utilities/acl/PermReg";

export type acRequest = {
  name: string;
};

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

type GroupEntry = {
  name: string;
  id: number;
};

type PermEntry = {
  name: string;
  extent: number;
  id: number;
};

export const initialisePermissions = async () => {
  await initGroups();
  await initPermissions();
  return StatusCodes.CREATED;
};

export const initGroups = async () => {
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

export const initPermissions = async () => {
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
