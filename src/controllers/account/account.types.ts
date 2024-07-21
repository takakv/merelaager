import joi, { ObjectSchema } from "joi";
import { ContainerTypes, ValidatedRequestSchema } from "express-joi-validation";

export const accountCreationRequestSchema: ObjectSchema = joi.object({
  fullName: joi.string().required(),
  nickname: joi.string().required(),
  username: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  token: joi.string().required(),
});

export interface AccountCreationRequestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Body]: {
    fullName: string;
    nickname: string;
    username: string;
    email: string;
    password: string;
    token: string;
  };
}
