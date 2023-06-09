import { Permission } from "../db/models/Permission";

// Keep the function name short to avoid ugly indentations.
export const approvePm = (
  permissions: Permission[],
  target: string
): boolean => {
  return (
    permissions.find(
      (permission: Permission): boolean => permission.permissionName === target
    ) !== undefined
  );
};
