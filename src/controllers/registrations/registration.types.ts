import joi, { ObjectSchema } from "joi";
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";

export const fetchRegistrationParamsSchema: ObjectSchema = joi.object({
  regId: joi.number().required(),
});

export interface FetchRegistrationRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Params]: {
    regId: number;
  };
}

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

export const patchRegistrationParamsSchema: ObjectSchema = joi.object({
  regId: joi.number().required(),
});

export const patchRegistrationBodySchema: ObjectSchema = joi.object({
  registered: joi.boolean(),
  old: joi.boolean(),
  pricePaid: joi.number(),
  priceToPay: joi.number(),
});

export interface PatchRegistrationRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Params]: {
    regId: number;
  };
  [ContainerTypes.Body]: {
    registered?: boolean;
    old?: boolean;
    pricePaid?: number;
    priceToPay?: number;
  };
}
