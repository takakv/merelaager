import SignUpToken from "../db/models/SignUpToken";
import User from "../db/models/User";
import ResetToken from "../db/models/ResetToken";

const bcrypt = require("bcrypt");
const UIDGenerator = require("uid-generator");
const MailService = require("./MailService");

const uidgen = new UIDGenerator(512);

const validateToken = async (token) => {
  const response = await SignUpToken.findByPk(token);
  return response && !response.isExpired;
};

exports.validateSuToken = validateToken;

exports.createSuToken = async (shiftNr, role = "op") => {
  const uid = await uidgen.generate();
  try {
    await SignUpToken.create({ token: uid, shiftNr, role });
  } catch (e) {
    console.error(e);
    return false;
  }
  return uid;
};

exports.destroyToken = async (token) => {
  await SignUpToken.destroy({ where: { token } });
};

exports.sendEmail = async (email, token) => {
  const mailService = new MailService();
  try {
    await mailService.sendAccountCreationMail(email, token);
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};

exports.checkUser = async (username) => {
  return !!(await User.findOne({ where: { username } }));
};

const validateResetToken = async (token, disable = false) => {
  const response = await ResetToken.findByPk(token);
  if (!response || response.isExpired) return false;
  const { createdAt } = response;
  const elapsed = Date.now() - createdAt;
  if (elapsed > 1200000 || disable) {
    response.isExpired = true;
    await response.save();
    return false;
  }
  return response.userId;
};

const disableResetToken = async (token) => {
  const response = await ResetToken.findByPk(token);
  if (token) {
    response.isExpired = true;
    await response.save();
  }
};

exports.validateResetToken = validateResetToken;

const getPwdHash = (password) => {
  return bcrypt.hashSync(password, parseInt(process.env.SALTR));
};

exports.changePwd = async (password, token) => {
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

exports.resetPwd = async (email) => {
  const user = await User.findOne({ where: { email }, attributes: ["id"] });
  if (!user) return false;

  const uid = await uidgen.generate();

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

exports.createAccount = async (username, password, token, name = null) => {
  const creationData = await SignUpToken.findByPk(token);
  if (!creationData || creationData.isExpired)
    return { error: "Kehtetu token" };

  const usernameExists = (await User.findOne({ where: { username } })) !== null;
  if (usernameExists) return { error: "Kasutajanimi on juba kasutuses" };

  const pwdHash = getPwdHash(password);
  try {
    await User.create({
      username,
      name,
      shifts: creationData.shiftNr,
      role: creationData.role,
      password: pwdHash,
    });
    creationData.isExpired = true;
    creationData.usedDate = new Date();
    await creationData.save();
  } catch (e) {
    console.error(e);
    return {
      error: "Süsteemi viga",
    };
  }
  return false;
};

exports.updateEmail = async (userId, email) => {
  const user = await User.findByPk(userId);

  if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email)) return false;
  user.email = email;
  await user.save();
  return true;
};
