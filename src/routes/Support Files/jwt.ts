import {User} from "../../db/models/User";

require("dotenv").config();
import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const rootRole = "root";

const generateAccessToken = (userData) => {
  const expiresIn = 1799;
  // noinspection JSCheckFunctionSignatures
  const accessToken = jwt.sign(userData, accessTokenSecret, {
    expiresIn: `${expiresIn}s`,
  });
  return { accessToken, expiresIn };
};

const generateRefreshToken = (userData) => {
  return jwt.sign(userData, refreshTokenSecret);
};

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, accessTokenSecret, async (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      const dbUser = await User.findOne({
        where: { username: user.username },
      });
      req.user.role = dbUser.role;
      req.user.id = dbUser.id;
      req.user.shift = dbUser.shifts;
      req.user.isRoot = dbUser.role === rootRole;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export { generateAccessToken, generateRefreshToken, verifyAccessToken };

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  refreshTokenSecret,
};