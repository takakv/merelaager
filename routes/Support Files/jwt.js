require("dotenv").config();
const jwt = require("jsonwebtoken");

const accessTokenSecret = process.env.TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

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

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  refreshTokenSecret,
};
