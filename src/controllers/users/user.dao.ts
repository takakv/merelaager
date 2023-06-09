import { User } from "../../db/models/User";

export const getUser = async (id: number): Promise<User> => {
  return User.findByPk(id);
};
