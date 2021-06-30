const db = require("../models/database");

const Team = db.team;
const DE = db.shiftData;

exports.createTeam = async (teamName, shiftNr) => {
  try {
    await Team.create({
      name: teamName,
      shiftNr: shiftNr,
      year: new Date().getUTCFullYear(),
    });
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};

const addMember = async (teamId, dataId) => {
  try {
    const entry = await DE.findByPk(dataId);
    if (!entry) return false;
    entry.teamId = teamId;
    await entry.save();
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};

exports.addMember = addMember;

exports.removeMember = async (dataId) => {
  return addMember(null, dataId);
};
