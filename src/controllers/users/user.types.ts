import joi, { ObjectSchema } from "joi";
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";

export const updateUserShiftSchema: ObjectSchema = joi.object({
  shiftNr: joi.number().required(),
});

export interface UpdateUserShiftParamsSchema extends ValidatedRequestSchema {
  [ContainerTypes.Params]: {
    shiftNr: number;
  };
}
