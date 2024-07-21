import { ValidatedRequest } from "express-joi-validation";
import { Response } from "express";
import { AccountCreationRequestSchema } from "./account.types";
import { SignUpToken } from "../../db/models/SignUpToken";
import { User } from "../../db/models/User";
import bcrypt from "bcrypt";
import { ShiftStaff } from "../../db/models/ShiftStaff";
import { getYear } from "../../routes/Support Files/functions";
import { StatusCodes } from "http-status-codes";

const span48h = 1.728e8;

const isExpired = (expiryDate: Date, elapse: number) => {
  return Date.now() - expiryDate.getTime() > elapse;
};

const getPwdHash = (password: string) => {
  return bcrypt.hashSync(password, parseInt(process.env.SALTR));
};

export const createAccountFunc = async (
  req: ValidatedRequest<AccountCreationRequestSchema>,
  res: Response,
) => {
  const creationInfo = await SignUpToken.findByPk(req.body.token);
  if (!creationInfo) {
    console.warn(
      `Token '${req.body.token}' not allocated. Requesting user: ${req.body.email}`,
    );
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json("Autentimistõend on kehtetu");
  }

  if (creationInfo.isExpired || isExpired(creationInfo.createdAt, span48h)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json("Autentimistõend on aegunud");
  }

  const usernameExists =
    (await User.findOne({ where: { username: req.body.username } })) !== null;
  if (usernameExists) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json("Kasutajanimi on juba kasutuses");
  }

  let nickname = req.body.nickname;
  if (!nickname) nickname = req.body.fullName.split(" ")[0];

  const pwdHash = getPwdHash(req.body.password);
  try {
    // Create a user.
    const user = await User.create({
      username: req.body.username,
      name: req.body.fullName,
      nickname: nickname,
      email: req.body.email,
      currentShift: creationInfo.shiftNr,
      role: "op",
      password: pwdHash,
    });

    // Deactivate the token.
    await creationInfo.destroy();

    // Check whether a staff entry exists. If not, create it and
    // associate it with the user.
    const [staffEntry, created] = await ShiftStaff.findOrCreate({
      where: {
        name: req.body.fullName,
        shiftNr: creationInfo.shiftNr,
        year: getYear(),
      },
      defaults: {
        name: req.body.fullName,
        role: creationInfo.role,
        shiftNr: creationInfo.shiftNr,
        year: getYear(),
        userId: user.id,
      },
    });

    // If the staff entry exists, associate it with the newly created user.
    if (!created) {
      staffEntry.userId = user.id;
      staffEntry.role = creationInfo.role;
      await staffEntry.save();
    }
  } catch (e) {
    console.error(e);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("Süsteemi viga");
  }

  return res.status(StatusCodes.CREATED).json("Konto loodud");
};
