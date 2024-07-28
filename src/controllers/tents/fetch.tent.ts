import { ValidatedRequest } from "express-joi-validation";
import { FetchTentRequestSchema } from "./tents.types";
import { Response } from "express";
import Entity = Express.Entity;
import { ShiftData } from "../../db/models/ShiftData";
import { User } from "../../db/models/User";
import { Child } from "../../db/models/Child";
import { TentScores } from "../../db/models/TentScores";

export const fetchTentFunc = async (
  req: ValidatedRequest<FetchTentRequestSchema>,
  res: Response
): Promise<void> => {
  const user: Entity = req.user;

  const { tentId } = req.params;
  const currentShift = (await User.findByPk(user.userId)).currentShift;

  const tentMembers = await ShiftData.findAll({
    where: { shiftNr: currentShift, tentNr: tentId },
  });

  const children: string[] = [];
  for (const member of tentMembers) {
    const tmp = await Child.findByPk(member.childId);
    children.push(tmp.name);
  }

  const grades: { score: number; date: Date }[] = [];
  const dbGrades = await TentScores.findAll({
    where: {
      shiftNr: currentShift,
      tentNr: tentId,
    },
  });
  for (const grade of dbGrades) {
    grades.push({
      score: grade.score,
      date: grade.createdAt as Date,
    });
  }

  res.json({ names: children, grades });
};
