import { User } from "../../db/models/User";

require("dotenv").config();
import jwt from "jsonwebtoken";
import { InvalidTokenError, MissingTokenError } from "./Errors/jwtAuth";
import { Request, Response, NextFunction } from "express";

const accessTokenSecret = process.env.TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const rootRole = "root";

type userData = {
  username: string;
};

const generateAccessToken = (userData: userData) => {
  const expiresIn = process.env.TOKEN_LIFETIME || 299;
  // noinspection JSCheckFunctionSignatures
  const accessToken: string = jwt.sign(userData, accessTokenSecret, {
    expiresIn: `${expiresIn}s`,
  });
  return { accessToken, expiresIn };
};

const generateRefreshToken = (userData: userData) => {
  const expiresIn = process.env.REFRESH_TOKEN_LIFETIME || 86399;
  return jwt.sign(userData, refreshTokenSecret, {
    expiresIn: `${expiresIn}s`,
  });
};

const populateInternalUser = async (req: Request, user: any) => {
  const dbUser = await User.findByPk(user.id);
  if (!dbUser) {
    return;
  }
  req.user.userId = user.id;
  req.user.isRoot = dbUser.role === rootRole;
};

const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json(new MissingTokenError().getJson());

  const token = authHeader.split(" ")[1];
  jwt.verify(token, accessTokenSecret, async (err, user) => {
    if (err) {
      return res.status(401).json(new InvalidTokenError().getJson());
    }
    await populateInternalUser(req, user);
    next();
  });
};

export { generateAccessToken, generateRefreshToken, verifyAccessToken };

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  refreshTokenSecret,
};
