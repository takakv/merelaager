import joi, { ObjectSchema } from "joi";
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";

export const fetchBillParamsSchema: ObjectSchema = joi.object({
  billNr: joi.number().required(),
});

export interface FetchBillRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Params]: {
    billNr: number;
  };
}
