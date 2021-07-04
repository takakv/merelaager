const bcrypt = require("bcrypt");
const UIDGenerator = require("uid-generator");
const db = require("../models/database");

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
  return true;
};

exports.create = async (username, password, token, name = null) => {
  const creationData = await SuToken.findByPk(token);
  if (!creationData || creationData.isExpired) return false;

  const usernameExists = (await User.findByPk(username)) !== null;
  if (usernameExists) return false;

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
    await creationData.save();
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};
