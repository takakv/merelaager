import joi, { ObjectSchema } from "joi";
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";

export const shiftRegistrationParamsSchema: ObjectSchema = joi.object({
  shiftNr: joi.number().required(),
});

export interface ShiftRegistrationRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Params]: {
    shiftNr: number;
  };
}

export const deleteRegistrationParamsSchema: ObjectSchema = joi.object({
  regId: joi.number().required(),
});

export interface DeleteRegistrationRequestSchema
  extends ValidatedRequestSchema {
  [ContainerTypes.Params]: {
    regId: number;
  };
}
