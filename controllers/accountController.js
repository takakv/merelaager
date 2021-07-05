const bcrypt = require("bcrypt");
const UIDGenerator = require("uid-generator");
const db = require("../models/database");
const MailService = require("./MailService");

const uidgen = new UIDGenerator(512);
const SuToken = db.suToken;
const User = db.users;

const validateToken = async (token) => {
  const response = await SuToken.findByPk(token);
  return response && !response.isExpired;
};

exports.validateSuToken = validateToken;

exports.createSuToken = async (shiftNr, role = "op") => {
  const uid = await uidgen.generate();
  try {
    await SuToken.create({ token: uid, shiftNr, role });
  } catch (e) {
    console.error(e);
    return false;
  }
  return uid;
};

exports.destroyToken = async (token) => {
  await SuToken.destroy({ where: { token } });
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

exports.create = async (username, password, token, name = null) => {
  const creationData = await SuToken.findByPk(token);
  if (!creationData || creationData.isExpired)
    return { error: "Kehtetu token" };

  const usernameExists = (await User.findOne({ where: { username } })) !== null;
  if (usernameExists) return { error: "Kasutajanimi on juba kasutuses" };

  const pwdHash = bcrypt.hashSync(password, parseInt(process.env.SALTR));
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
