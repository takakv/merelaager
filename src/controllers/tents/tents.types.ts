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
