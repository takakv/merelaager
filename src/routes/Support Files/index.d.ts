declare namespace Express {
  export interface ShiftPermissionRoles {
    [key: number]: number;
  }

  export interface Entity {
    userId: number;
    shiftRoles: ShiftPermissionRoles;
    isRoot: boolean;
  }

  export interface Request {
    user?: Entity;
  }
}
