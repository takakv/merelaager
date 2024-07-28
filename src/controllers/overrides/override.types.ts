import joi, { ObjectSchema } from "joi";
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";

export const overrideBodySchema: ObjectSchema = joi.object({
  token: joi.string().required(),
});

export interface OverrideRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Body]: {
    token: string;
  };
}
