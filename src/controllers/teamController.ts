import { Team } from "../db/models/Team";
import { ShiftData } from "../db/models/ShiftData";
import { Child } from "../db/models/Child";
import { getYear } from "../routes/Support Files/functions";

const createChildObject = (data) => {
  return { id: data.id, name: data.child.name };
};

exports.fetchForShift = async (shiftNr: number) => {
  const teams = await Team.findAll({ where: { shiftNr, year: getYear() } });
  if (!teams) return null;

  const children = await ShiftData.findAll({
    where: { shiftNr },
    order: [["childId", "ASC"]],
    include: {
      model: Child,
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

exports.createTeam = async (teamName: string, shiftNr: number) => {
  try {
    await Team.create({
      name: teamName,
      shiftNr: shiftNr,
    });
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};

const addMember = async (teamId: number, dataId: number) => {
  try {
    const entry = await ShiftData.findByPk(dataId);
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

exports.removeMember = async (dataId: number) => {
  return addMember(null, dataId);
};

exports.setPlace = async (teamId: number, place: number) => {
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
