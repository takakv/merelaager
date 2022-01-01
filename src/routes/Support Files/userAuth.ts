import bcrypt from "bcrypt";
import db from "../../models/database";
import { generateAccessToken, generateRefreshToken } from "./jwt";

const Users = db.users;

const authenticateUser = async (username, password) => {
  const user = await secureFetchUser(username, password);
  if (!user) return false;
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
  const user = await Users.findOne({
    where: { username: username.toLowerCase() },
  });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return null;
  }
  return { username: user.username };
};

const storeRefreshToken = (refreshToken, username) => {
  username = username.toLowerCase();
  Users.update({ refreshToken }, { where: { username } }).catch(console.error);
};

const matchToken = async (refreshToken) => {
  const user = await Users.findOne({ where: { refreshToken } });
  return !!user;
};

module.exports = {
  authenticateUser,
  matchToken,
};
