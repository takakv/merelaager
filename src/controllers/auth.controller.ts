import dotenv from "dotenv";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";

import { User } from "../db/models/User";

import {
  generateAccessToken,
  generateRefreshToken,
  JWTUserTokenData,
} from "../utilities/jwt";

dotenv.config();

const cookieDomain: string = process.env.COOKIE_DOMAIN;
const cookieMaxAge: number = parseInt(process.env.COOKIE_MAXAGE);
const cookieSecure: boolean = process.env.COOKIE_SECURE === "true";

interface LogInObject {
  username: string;
  password: string;
}

const authenticateUser = async (
  username: string,
  password: string
): Promise<number | null> => {
  const user = await User.findOne({
    where: { username: username.toLowerCase() },
  });

  if (!user) return null;
  if (!bcrypt.compareSync(password, user.password)) return null;

  return user.id;
};

const authenticateUserFromToken = async (
  refreshToken: string
): Promise<number | null> => {
  const user = await User.findOne({ where: { refreshToken } });

  if (!user) return null;

  return user.id;
};

const storeRefreshToken = (userId: number, refreshToken: string): void => {
  User.update({ refreshToken }, { where: { id: userId } }).catch(console.error);
};

/**
 * Logs a user in based on their username and password, by providing a
 * short-lived access token. Also returns a long-lived refresh token which can
 * be used to refresh the access token.
 */
export const logInUser = async (
  req: Request<object, object, LogInObject>,
  res: Response
): Promise<void> => {
  const { username, password } = req.body;

  if (username === undefined || password === undefined) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  const userId: number = await authenticateUser(username, password);
  if (userId === null) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  const tokenType = "Bearer";
  const tokenData: JWTUserTokenData = { userId: userId };

  const accessToken: string = generateAccessToken(tokenData);
  const refreshToken: string = generateRefreshToken(tokenData);
  storeRefreshToken(userId, refreshToken);

  const cookieOptions: object = {
    secure: cookieSecure,
    httpOnly: true,
    sameSite: "strict",
    domain: cookieDomain,
    maxAge: cookieMaxAge,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.json({
    tokenType,
    accessToken,
  });
};

/**
 * Returns a new short-lived access token for a user who prolongs their access
 * using their refresh token.
 */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const token: string = req.cookies.refreshToken;

  if (!token) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  const userId: number = await authenticateUserFromToken(token);

  if (userId === null) {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
    return;
  }

  const tokenType = "Bearer";
  const tokenData: JWTUserTokenData = { userId: userId };
  const accessToken: string = generateAccessToken(tokenData);

  res.json({
    tokenType,
    accessToken,
  });
};
