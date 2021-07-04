const UIDGenerator = require("uid-generator");
const db = require("../models/database");

const uidgen = new UIDGenerator(512);
const SuToken = db.suToken;

exports.validateSuToken = async (token) => {
  const response = await SuToken.findByPk(token);
  return response && !response.isExpired;
};

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
