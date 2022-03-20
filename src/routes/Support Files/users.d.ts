export interface UserData {
  name: string;
  currentShift: number;
  isRoot: boolean;
  role: string;
  shifts: UserShift[];
}

export interface UserShift {
  id: number;
  role: string;
}
