import joi, { ObjectSchema } from "joi";
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";

type RegChildInfo = {
  name: string;
  idCode: string;
  shift: number;
  shirtSize: string;
  road: string;
  city: string;
  county: string;
  country: string;
  addendum: string;
  isNew: boolean;
  sex: string;
  dob: string;
  useIdCode: boolean;
};

export const registerBodySchema: ObjectSchema = joi.object({
  children: joi
    .array()
    .items(
      joi
        .object({
          name: joi.string().max(255),
          idCode: joi.string().max(11),
          shift: joi.number(),
          shirtSize: joi.string(),
          road: joi.string(),
          city: joi.string(),
          county: joi.string(),
          country: joi.string(),
          addendum: joi.string().allow("").max(255),
          isNew: joi.boolean(),
          sex: joi.string().allow(""),
          dob: joi.string().allow(""),
          useIdCode: joi.boolean(),
        })
        .options({ presence: "required" }),
    )
    .required(),
  contactName: joi.string().max(255).required(),
  contactEmail: joi.string().max(255).email().required(),
  contactNumber: joi.string().max(25).required(),
  backupTel: joi.string().allow("").max(25).required(),
});

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
