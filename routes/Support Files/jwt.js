require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const db = require("../../models/database");

const accessTokenSecret = process.env.TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const Users = db.users;

const generateAccessToken = (userData) => {
  return jwt.sign(userData, accessTokenSecret, { expiresIn: "1800s" });
};

const generateRefreshToken = (userData) => {
  return jwt.sign(userData, refreshTokenSecret);
};

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, accessTokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const fetchUser = async (username, password) => {
  const user = await Users.findByPk(username.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return null;
  }
  return {
    name: user.name,
    role: user.role,
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  fetchUser,
};
