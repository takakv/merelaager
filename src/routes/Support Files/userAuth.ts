import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "./jwt";
import { User } from "../../db/models/User";

export const authenticateUser = async (username: string, password: string) => {
  const user = await secureFetchUser(username, password);
  if (!user) return null;

  const tokenType = "Bearer";
  const { accessToken, expiresIn } = generateAccessToken({
    username: user.username,
  });
  const refreshToken = generateRefreshToken({
    username: user.username,
  });
  storeRefreshToken(refreshToken, username);
  return { tokenType, accessToken, expiresIn, refreshToken };
};

const secureFetchUser = async (username, password) => {
  const user = await User.findOne({
    where: { username: username.toLowerCase() },
  });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return null;
  }
  return { username: user.username };
};

const storeRefreshToken = (refreshToken, username) => {
  username = username.toLowerCase();
  User.update({ refreshToken }, { where: { username } }).catch(console.error);
};

export const matchToken = async (refreshToken) => {
  const user = await User.findOne({ where: { refreshToken } });
  return !!user;
};
