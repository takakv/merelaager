import joi, { ObjectSchema } from "joi";
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";

export const overrideBodySchema: ObjectSchema = joi.object({
  token: joi.number().required(),
});

export interface OverrideRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Body]: {
    token: string;
  };
}
