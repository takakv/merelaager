import { sign, verify } from "jsonwebtoken";

const accessTokenSecret: string = process.env.TOKEN_SECRET;
const refreshTokenSecret: string = process.env.REFRESH_TOKEN_SECRET;

const accessTokenLifetime = parseInt(process.env.TOKEN_LIFETIME, 10);
const refreshTokenLifetime = parseInt(process.env.REFRESH_TOKEN_LIFETIME, 10);

export interface JWTUserTokenData {
  userId: number;
}

export const generateAccessToken = (tokenData: JWTUserTokenData): string => {
  const expiresIn = accessTokenLifetime || 299;
  return sign(tokenData, accessTokenSecret, {
    expiresIn: `${expiresIn}s`,
  });
};

export const generateRefreshToken = (tokenData: JWTUserTokenData): string => {
  const expiresIn = refreshTokenLifetime || 86399;
  return sign(tokenData, accessTokenSecret, {
    expiresIn: `${expiresIn}s`,
  });
};

export const verifyAccessToken = (token: string): JWTUserTokenData => {
  try {
    return verify(token, accessTokenSecret) as JWTUserTokenData;
  } catch (e) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JWTUserTokenData => {
  try {
    return verify(token, refreshTokenSecret) as JWTUserTokenData;
  } catch (e) {
    return null;
  }
};
