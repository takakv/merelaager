const db = require("../models/database");

const Team = db.team;
const DE = db.shiftData;
const ShiftData = db.shiftData;
const Children = db.newChildren;

exports.fetchForShift = async (shiftNr) => {
  const teams = await Team.findAll({where: {shiftNr}});
  if (!teams) return null;

  const children = await ShiftData.findAll({
    where: {shiftNr},
    order: [["childId", "ASC"]],
    include: {
      model: Children,
      attributes: ["name"]
    },
    attributes: ["id", "teamId"],
  });
  if (!children) return null;

  const resObj = {};
  teams.forEach((team) => {
    const members = children.filter(child => child.teamId === team.id).map(member => {
      return {id: member.id, name: member.child.name}
    })
    resObj[team.id] = {
      id: team.id,
      name: team.name,
      place: team.place,
      members
    };
  });
  return resObj;
};

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
