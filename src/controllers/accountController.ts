import { SignUpToken } from "../db/models/SignUpToken";
import { User } from "../db/models/User";
import { ResetToken } from "../db/models/ResetToken";
import { v4 as uuidv4 } from "uuid";

const bcrypt = require("bcrypt");

import MailService from "./MailService";
import Entity = Express.Entity;
import { StatusCodes } from "http-status-codes";
import { roles, ShiftStaff } from "../db/models/ShiftStaff";
import { getYear } from "../routes/Support Files/functions";

const span48h = 1.728e8;

const mailService = new MailService();

exports.sendEmail = async (email: string, token: string) => {
  try {
    await mailService.sendAccountCreationMail(email, token);
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};

exports.checkUser = async (username: string) => {
  return !!(await User.findOne({ where: { username } }));
};

const validateResetToken = async (token: string, disable = false) => {
  const response = await ResetToken.findByPk(token);
  if (!response || response.isExpired) return false;
  const { createdAt } = response;
  const elapsed = Date.now() - createdAt.getTime();
  if (elapsed > 1200000 || disable) {
    response.isExpired = true;
    await response.save();
    return false;
  }
  return response.userId;
};

const disableResetToken = async (token: string) => {
  const response = await ResetToken.findByPk(token);
  if (token) {
    response.isExpired = true;
    await response.save();
  }
};

exports.validateResetToken = validateResetToken;

const getPwdHash = (password: string) => {
  return bcrypt.hashSync(password, parseInt(process.env.SALTR));
};

exports.changePwd = async (password: string, token: string) => {
  const userId = await validateResetToken(token);
  if (!userId) return false;

  const pwdHash = getPwdHash(password);
  const user = await User.findByPk(userId);
  if (!user) return false;
  user.password = pwdHash;
  await user.save();
  await disableResetToken(token);
  return true;
};

exports.resetPwd = async (email: string) => {
  const user = await User.findOne({ where: { email }, attributes: ["id"] });
  if (!user) return false;

  const uid = uuidv4();

  try {
    const exists = await ResetToken.findByPk(uid);
    if (exists) return false;
    await ResetToken.create({
      token: uid,
      userId: user.id,
    });
  } catch (e) {
    console.error(e);
    return false;
  }

  try {
    const mailService = new MailService();
    await mailService.sendPwdResetMail(email, uid);
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
};

exports.updateEmail = async (userId: number, email: string) => {
  const user = await User.findByPk(userId);

  if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email)) return false;
  user.email = email;
  await user.save();
  return true;
};

export const createAccount = async (
  username: string,
  password: string,
  token: string,
  name: string,
  nickname: string = null
) => {
  const creationInfo = await SignUpToken.findByPk(token);

  if (!creationInfo) return "The token is invalid.";

  if (creationInfo.isExpired || isExpired(creationInfo.createdAt, span48h))
    return "Token is expired";

  const usernameExists = (await User.findOne({ where: { username } })) !== null;
  if (usernameExists) return "Kasutajanimi on juba kasutuses";

  if (!nickname) nickname = name.split(" ")[0];
  const pwdHash = getPwdHash(password);
  try {
    // Deactivate the token.
    await creationInfo.destroy();

    // Create a user.
    const user = await User.create({
      username,
      name,
      nickname,
      email: creationInfo.email,
      currentShift: creationInfo.shiftNr,
      role: "op",
      password: pwdHash,
    });

    // Check whether a staff entry exists. If not, create it and
    // associate it with the user.
    const [staffEntry, created] = await ShiftStaff.findOrCreate({
      where: { name, shiftNr: creationInfo.shiftNr, year: getYear() },
      defaults: {
        name,
        role: creationInfo.role,
        shiftNr: creationInfo.shiftNr,
        year: getYear(),
        userId: user.id,
      },
    });

    // If the staff entry exists, associate it with the newly created user.
    if (!created) {
      staffEntry.userId = user.id;
      staffEntry.role = creationInfo.role;
      await staffEntry.save();
    }
  } catch (e) {
    console.error(e);
    return "Süsteemi viga";
  }
  return "";
};

const createSignupToken = async (
  email: string,
  shiftNr: number,
  role: string
) => {
  const token = uuidv4();
  try {
    await SignUpToken.create({ token, email, shiftNr, role });
  } catch (e) {
    console.error(e);
    return null;
  }
  return token;
};

const isExpired = (expiryDate: Date, elapse: number) => {
  return Date.now() - expiryDate.getTime() > elapse;
};

export const validateSignupToken = async (token: string) => {
  const response = await SignUpToken.findByPk(token);
  if (!response) return false;

  const expiryDate = new Date(response.createdAt);
  const now = new Date();

  // 48 hours
  if (now.getTime() - expiryDate.getTime() > 1.728e8) {
    response.isExpired = true;
    try {
      await response.save();
    } catch (e) {
      console.error(e);
    }
  }
  return response.isExpired;
};

export const generateAccessDelegationLink = async (
  email: string,
  shiftNr: number,
  role: string,
  author: Entity
) => {
  if (!email || Number.isNaN(shiftNr)) return StatusCodes.BAD_REQUEST;
  if (!role || !Object.values(roles).includes(role))
    return StatusCodes.BAD_REQUEST;

  // Allow adding only users of own shift.
  // if (shiftNr !== author.shift) return StatusCodes.FORBIDDEN;

  let user = await User.findOne({ where: { email } });
  if (!user) {
    const token = await createSignupToken(email, shiftNr, role);
    if (!token) return StatusCodes.INTERNAL_SERVER_ERROR;

    const emailStatus = exports.sendEmail(email, token);

    if (emailStatus) return StatusCodes.OK;
    await SignUpToken.destroy({ where: { token } });
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }

  // TODO: implement access delegation for existing accounts.
  return StatusCodes.NOT_IMPLEMENTED;
};
