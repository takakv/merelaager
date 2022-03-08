declare namespace Express {
  export interface Entity {
    id: number;
    username: string;
    isRoot: boolean;
    shift: number;
    role: string;
  }

  export interface Request {
    user?: Entity;
  }
}
