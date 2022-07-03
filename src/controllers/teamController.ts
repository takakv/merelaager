import { Team } from "../db/models/Team";
import { getYear } from "../routes/Support Files/functions";
import { StatusCodes } from "http-status-codes";
import Entity = Express.Entity;

export const fetchForYear = async (year: number, shiftNr: number) => {
  type teamData = {
    id: number;
    shiftNr: number;
    name: string;
  };

  type responseData = {
    data: teamData[];
    statusCode: number;
  };

  const data: responseData = {
    data: [],
    statusCode: StatusCodes.OK,
  };

  if (Number.isNaN(year) || year > getYear()) {
    data.statusCode = StatusCodes.BAD_REQUEST;
    return data;
  }

  const teams = await Team.findAll(
    Number.isNaN(shiftNr) ? { where: { year } } : { where: { year, shiftNr } }
  );

  if (!teams) {
    data.statusCode = StatusCodes.NOT_FOUND;
    return data;
  }

  teams.forEach((team) =>
    data.data.push({ name: team.name, id: team.id, shiftNr: team.shiftNr })
  );

  return data;
};

export const createTeam = async (
  year: number,
  shiftNr: number,
  name: string
) => {
  type responseData = {
    data: Team | {};
    statusCode: number;
  };

  const data: responseData = {
    data: {},
    statusCode: StatusCodes.BAD_REQUEST,
  };

  if (Number.isNaN(year) || Number.isNaN(shiftNr)) return data;
  if (year < 1999 || year > new Date().getFullYear() + 1) return data;
  if (shiftNr < 1) return data;
  if (!name) return data;

  let team: Team;

  try {
    team = await Team.create({
      name,
      shiftNr,
      year,
    });
  } catch (e) {
    console.error(e);
    data.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    return data;
  }

  data.statusCode = StatusCodes.CREATED;
  data.data = team;
  return data;
};

export const deleteTeam = async (teamId: number, user: Entity) => {
  if (Number.isNaN(teamId)) return StatusCodes.BAD_REQUEST;

  const team = await Team.findByPk(teamId);
  if (!team) return StatusCodes.NOT_FOUND;

  if (team.shiftNr !== user.shift) return StatusCodes.FORBIDDEN;

  // Only allow deleting teams from this year.
  if (team.year !== getYear()) return StatusCodes.METHOD_NOT_ALLOWED;

  try {
    await Team.destroy({ where: { id: teamId } });
  } catch (e) {
    console.error(e);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }

  return StatusCodes.NO_CONTENT;
};
