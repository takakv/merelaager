import joi, { ObjectSchema } from "joi";
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";

export const fetchTentParamsSchema: ObjectSchema = joi.object({
  tentId: joi.number().required(),
});

export interface FetchTentRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Params]: {
    tentId: number;
  };
}

export const tentScoreParamsSchema: ObjectSchema = joi.object({
  tentId: joi.number().required(),
});

export const tentScoreBodySchema: ObjectSchema = joi.object({
  shiftNr: joi.number().required(),
  score: joi.number().required(),
});

export interface TentScoreRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Params]: {
    tentId: number;
  };
  [ContainerTypes.Body]: {
    shiftNr: number;
    score: number;
  };
}
