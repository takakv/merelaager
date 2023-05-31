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
  await RolePermission.findOrCreate({
    where: {
      roleId: roleDbLinks[Constants.SHIFT_ROLE_ROOT],
      permissionId: permissionDbLinks[Constants.PERMISSION_VIEW_REG_FULL],
    },
  });

  // BOSS stuff only.
  await RolePermission.findOrCreate({
    where: {
      roleId: roleDbLinks[Constants.SHIFT_ROLE_BOSS],
      permissionId: permissionDbLinks[Constants.PERMISSION_VIEW_REG_CONTACT],
    },
  });

  await RolePermission.findOrCreate({
    where: {
      roleId: roleDbLinks[Constants.SHIFT_ROLE_BOSS],
      permissionId: permissionDbLinks[Constants.PERMISSION_VIEW_REG_PRICE],
    },
  });

  await RolePermission.findOrCreate({
    where: {
      roleId: roleDbLinks[Constants.SHIFT_ROLE_BOSS],
      permissionId: permissionDbLinks[Constants.PERMISSION_VIEW_REG_PI],
    },
  });

  // Shared permissions for ROOT and BOSS.
  for (const role of [Constants.SHIFT_ROLE_BOSS, Constants.SHIFT_ROLE_BOSS]) {
    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[role],
        permissionId: permissionDbLinks[Constants.PERMISSION_EDIT_REG_STATUS],
      },
    });

    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[role],
        permissionId: permissionDbLinks[Constants.PERMISSION_EDIT_REG_PRICE],
      },
    });

    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[role],
        permissionId: permissionDbLinks[Constants.PERMISSION_DELETE_REG],
      },
    });
  }

  // Shared permissions for BOSS, INSTRUCTOR, and HELPER.
  for (const role of [
    Constants.SHIFT_ROLE_BOSS,
    Constants.SHIFT_ROLE_INSTRUCTOR,
    Constants.SHIFT_ROLE_HELPER,
  ]) {
    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[role],
        permissionId: permissionDbLinks[Constants.PERMISSION_VIEW_REG_BASIC],
      },
    });

    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[role],
        permissionId: permissionDbLinks[Constants.PERMISSION_EDIT_CAMPER],
      },
    });

    await RolePermission.findOrCreate({
      where: {
        roleId: roleDbLinks[role],
        permissionId: permissionDbLinks[Constants.PERMISSION_EDIT_TEAM],
      },
    });
  }
};
