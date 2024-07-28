import { ValidatedRequest } from "express-joi-validation";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";

import { TentScoreRequestSchema } from "./tents.types";
import { TentScores } from "../../db/models/TentScores";

export const gradeTentFunc = async (
  req: ValidatedRequest<TentScoreRequestSchema>,
  res: Response
): Promise<void> => {
  const { tentId } = req.params;
  const { shiftNr, score } = req.body;

  if (score < 1 || score > 10) {
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return;
  }

  await TentScores.create({
    shiftNr: shiftNr,
    tentNr: tentId,
    score: score,
  });

  res.sendStatus(StatusCodes.CREATED);
};
