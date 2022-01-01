import db from "../models/database";

const Team = db.team;
const DE = db.shiftData;
const ShiftData = db.shiftData;
const Children = db.child;

const createChildObject = (data) => {
  return { id: data.id, name: data.child.name };
};

exports.fetchForShift = async (shiftNr) => {
  const teams = await Team.findAll({ where: { shiftNr } });
  if (!teams) return null;

  const children = await ShiftData.findAll({
    where: { shiftNr },
    order: [["childId", "ASC"]],
    include: {
      model: Children,
      attributes: ["name"],
    },
    attributes: ["id", "teamId"],
  });
  if (!children) return null;

  const resObj = {
    teams: {},
    teamless: children.filter((child) => !child.teamId).map(createChildObject),
  };
  teams.forEach((team) => {
    const members = children
      .filter((child) => child.teamId === team.id)
      .map(createChildObject);
    resObj.teams[team.id] = {
      id: team.id,
      name: team.name,
      place: team.place,
      members,
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

exports.setPlace = async (teamId, place) => {
  try {
    const team = await Team.findByPk(teamId);
    if (!team) return false;
    team.place = place;
    await team.save();
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};
