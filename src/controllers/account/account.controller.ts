import { createAccountFunc } from "./create.account";
import { ValidatedRequest } from "express-joi-validation";
import {
  InitiatePasswordResetRequestSchema,
  PasswordResetRequestSchema,
} from "./account.types";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../../db/models/User";
import {
  initiatePasswordResetInternal,
  resetPasswordInternal,
} from "../accountController";

export const createAccount = createAccountFunc;

export const initiatePasswordReset = async (
  req: ValidatedRequest<InitiatePasswordResetRequestSchema>,
  res: Response,
) => {
  const user = await User.findOne({
    where: { email: req.body.email },
    attributes: ["id"],
  });

  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json("Meiliaadressiga kontot ei leitud");
  }

  const state = await initiatePasswordResetInternal(req.body.email);
  if (state) return res.status(StatusCodes.ACCEPTED).json("Meil saadetud");
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Süsteemi viga");
};

export const resetPassword = async (
  req: ValidatedRequest<PasswordResetRequestSchema>,
  res: Response,
) => {
  const state = await resetPasswordInternal(req.body.password, req.body.token);
  if (state)
    return res.status(StatusCodes.NO_CONTENT).send("Salasõna edukalt muudetud");
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Süsteemi viga");
};
