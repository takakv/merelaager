const bcrypt = require("bcrypt");
const db = require("../../models/database");
const jwt = require("./jwt");

const Users = db.users;

const authenticateUser = async (username, password) => {
  const user = await secureFetchUser(username, password);
  if (!user) return false;
  const accessToken = jwt.generateAccessToken({
    username: user.name,
    role: user.role,
  });
  const refreshToken = jwt.generateRefreshToken({
    username: user.name,
    role: user.role,
  });
  storeRefreshToken(refreshToken, username);
  return {
    accessToken,
    refreshToken,
    user: { name: user.name, role: user.role },
  };
};

const secureFetchUser = async (username, password) => {
  const user = await Users.findByPk(username.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return null;
  }
  return {
    name: user.name,
    role: user.role,
  };
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
