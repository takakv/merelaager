import Constants from "../utils/constants";
import { Permission } from "./models/Permission";
import { Role } from "./models/Role";
import { RolePermission } from "./models/RolePermission";

interface DBLink {
  [key: string]: number;
}

const getPermissionRoleNames = (): string[] => {
  return [
    Constants.SHIFT_ROLE_ROOT,
    Constants.SHIFT_ROLE_BOSS,
    Constants.SHIFT_ROLE_INSTRUCTOR,
    Constants.SHIFT_ROLE_HELPER,
    Constants.SHIFT_ROLE_REG_VIEWER_BASIC,
  ];
};

const getPermissionNames = (): string[] => {
  return [
    Constants.PERMISSION_VIEW_REG_BASIC,
    Constants.PERMISSION_VIEW_REG_CONTACT,
    Constants.PERMISSION_VIEW_REG_PRICE,
    Constants.PERMISSION_VIEW_REG_PI,
    Constants.PERMISSION_VIEW_REG_FULL,
    Constants.PERMISSION_EDIT_REG_STATUS,
    Constants.PERMISSION_EDIT_REG_PRICE,
    Constants.PERMISSION_EDIT_CAMPER,
    Constants.PERMISSION_EDIT_TEAM,
    Constants.PERMISSION_DELETE_REG,
  ];
};

const createPermissionRoles = async (): Promise<DBLink> => {
  const roleNames: string[] = getPermissionRoleNames();

  const roleDbLinks: DBLink = {};

  for (const roleName of roleNames) {
    const role: Role = (
      await Role.findOrCreate({
        where: { roleName },
      })
    )[0];
    roleDbLinks[roleName] = role.id;
  }

  return roleDbLinks;
};

const createPermissions = async (): Promise<DBLink> => {
  const permissionNames: string[] = getPermissionNames();

  const permissionDbLinks: DBLink = {};

  for (const permissionName of permissionNames) {
    const permission: Permission = (
      await Permission.findOrCreate({
        where: { permissionName },
      })
    )[0];
    permissionDbLinks[permissionName] = permission.id;
  }

  return permissionDbLinks;
};

export const matchPermissionsToRoles = async (): Promise<void> => {
  const roleDbLinks: DBLink = await createPermissionRoles();
  const permissionDbLinks: DBLink = await createPermissions();

  // DO NOT PARALLELIZE THE QUERIES! The DB will hang, hence why every query
  // is awaited separately.

  // ROOT stuff only.
  for (const permission of [
    Constants.PERMISSION_VIEW_REG_FULL,
    Constants.PERMISSION_EDIT_REG_STATUS,
    Constants.PERMISSION_EDIT_REG_PRICE,
    Constants.PERMISSION_DELETE_REG,
  ]) {
    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[Constants.SHIFT_ROLE_ROOT],
        permissionId: permissionDbLinks[permission],
      },
    });
  }

  // BOSS stuff only.
  for (const permission of [
    Constants.PERMISSION_VIEW_REG_BASIC,
    Constants.PERMISSION_VIEW_REG_CONTACT,
    Constants.PERMISSION_VIEW_REG_PRICE,
    Constants.PERMISSION_VIEW_REG_PI,
    Constants.PERMISSION_EDIT_REG_STATUS,
    Constants.PERMISSION_EDIT_REG_PRICE,
    Constants.PERMISSION_DELETE_REG,
  ]) {
    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[Constants.SHIFT_ROLE_BOSS],
        permissionId: permissionDbLinks[permission],
      },
    });
  }

  // INSTRUCTOR stuff only.
  for (const permission of [Constants.PERMISSION_VIEW_REG_BASIC]) {
    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[Constants.SHIFT_ROLE_INSTRUCTOR],
        permissionId: permissionDbLinks[permission],
      },
    });
  }

  // HELPER stuff only.
  for (const permission of [Constants.PERMISSION_VIEW_REG_BASIC]) {
    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[Constants.SHIFT_ROLE_HELPER],
        permissionId: permissionDbLinks[permission],
      },
    });
  }

  // Shared permissions for everyone
  for (const role of [
    Constants.SHIFT_ROLE_ROOT,
    Constants.SHIFT_ROLE_BOSS,
    Constants.SHIFT_ROLE_INSTRUCTOR,
    Constants.SHIFT_ROLE_HELPER,
  ]) {
    for (const permission of [
      Constants.PERMISSION_EDIT_CAMPER,
      Constants.PERMISSION_EDIT_TEAM,
    ]) {
      await RolePermission.findOrCreate({
        where: {
          roleId: roleDbLinks[role],
          permissionId: permissionDbLinks[permission],
        },
      });
    }
  }

  // Registration viewer permissions.
  for (const permission of [Constants.PERMISSION_VIEW_REG_BASIC]) {
    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[Constants.SHIFT_ROLE_REG_VIEWER_BASIC],
        permissionId: permissionDbLinks[permission],
      },
    });
  }
};
