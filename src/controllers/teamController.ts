import { Team } from "../db/models/Team";
import { getYear } from "../routes/Support Files/functions";

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
    statusCode: 200,
  };

  if (Number.isNaN(year) || year > getYear()) {
    data.statusCode = 400;
    return data;
  }

  const teams = await Team.findAll(
    Number.isNaN(shiftNr) ? { where: { year } } : { where: { year, shiftNr } }
  );

  if (!teams) {
    data.statusCode = 404;
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
): Promise<number> => {
  if (Number.isNaN(year) || Number.isNaN(shiftNr)) return 400;
  if (year < 1999 || year > new Date().getFullYear() + 1) return 400;
  if (shiftNr < 1) return 400;
  if (!name) return 400;

  try {
    await Team.create({
      name,
      shiftNr,
      year,
    });
  } catch (e) {
    console.error(e);
    return 500;
  }

  return 201;
};
