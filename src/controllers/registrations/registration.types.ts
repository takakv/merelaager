import joi, { type ObjectSchema } from "joi";
import {
  ContainerTypes,
  type ValidatedRequestSchema,
} from "express-joi-validation";

const STRING_MAX = 255;

type ChildInfo = {
  name: string;
  idCode?: string;
  sex?: string;
  dob?: Date;
  addendum?: string;
};

type CampInfo = {
  shiftNr: number;
  isNew: boolean;
  shirtSize: string;
};

type AddressInfo = {
  road: string;
  city: string;
  county: string;
  country: string;
};

type ParentInfo = {
  contactName: string;
  contactEmail: string;
  contactNumber: string;
  backupTel?: string;
};

type EmailStatus = {
  sendEmail?: boolean;
};

type RegistrationRequest = ChildInfo &
  CampInfo &
  AddressInfo &
  ParentInfo &
  EmailStatus;

export const registerBodySchema = joi.array<RegistrationRequest>().items(
  joi.object<RegistrationRequest>({
    name: joi.string().required(),
    // ID code is required unless sex and date of birth are specified.
    idCode: joi
      .string()
      .min(11)
      .max(11)
      .when("sex", {
        is: joi.any().valid(null, ""),
        then: joi.required(),
      })
      .when("sex", { is: joi.any().valid(null, ""), then: joi.required() }),
    sex: joi.allow("M", "F"),
    dob: joi.date(),
    addendum: joi.string().max(STRING_MAX),
    shiftNr: joi.number().min(1).max(4).required(),
    isNew: joi.boolean().required(),
    shirtSize: joi.string().max(10).required(),
    road: joi.string().max(STRING_MAX).required(),
    city: joi.string().max(STRING_MAX).required(),
    county: joi.string().max(STRING_MAX).required(),
    country: joi.string().max(STRING_MAX).required(),
    contactName: joi.string().max(STRING_MAX).required(),
    contactEmail: joi.string().max(STRING_MAX).email().required(),
    contactNumber: joi.string().max(25).required(),
    backupTel: joi.string().max(25),
    sendEmail: joi.boolean(),
  }),
);

export interface CreateRegistrationRequestSchema
  extends ValidatedRequestSchema {
  [ContainerTypes.Body]: RegistrationRequest[];
}

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

export interface RegistrationDbEntry {
  regOrder: number;
  childId: number;
  idCode: string;
  shiftNr: number;
  isOld: boolean;
  birthday: Date;
  tsSize: string;
  addendum: string;
  road: string;
  city: string;
  county: string;
  country: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  backupTel: string;
  priceToPay: number;
}

export type EmailReceiptInfo = {
  name: string;
  shiftNr: number;
  contactEmail: string;
};
