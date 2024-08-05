import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  generateAccessDelegationLink,
  validateSignupToken,
} from "../../controllers/accountController";
import { validateBody } from "../../middleware/reqvalidate.middleware";
import {
  accountCreationRequestSchema,
  initiatePasswordResetRequestSchema,
  passwordResetRequestSchema,
} from "../../controllers/account/account.types";
import {
  createAccount,
  initiatePasswordReset,
  resetPassword,
} from "../../controllers/account/account.controller";

const router = express.Router();

const account = require("../../controllers/accountController");
const user = require("../../controllers/userController");
const jwt = require("../Support Files/jwt");

router.get("/create/:token", async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token) return StatusCodes.BAD_REQUEST;
  const result = validateSignupToken(token);
  if (!result) return res.sendStatus(StatusCodes.UNAUTHORIZED);

  res.render("accountReg", {
    title: "Loo kasutaja",
    layout: "empty",
    script_path: "/media/scripts/signup.js",
  });
});

router.get("/:token/", async (req: Request, res: Response) => {
  const response = await account.validateSuToken(req.params.token);
  if (!response) return res.sendStatus(401);
  else
    res.render("accountReg", {
      title: "Loo kasutaja",
      layout: "empty",
      script_path: "/media/scripts/signup.js",
    });
});

router.post("/chkusr/", async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) return res.sendStatus(400);
  if (await account.checkUser(username)) res.sendStatus(200);
  else res.sendStatus(404);
});

router.post(
  "/create",
  validateBody(accountCreationRequestSchema),
  createAccount,
);

router.get("/reset/:token/", async (req: Request, res: Response) => {
  const isValid = await account.validateResetToken(req.params.token);
  if (!isValid) return res.sendStatus(403);
  res.render("pwdReset", {
    title: "Vaheta salasõna",
    layout: "empty",
    script_path: "/media/scripts/pwdreset.js",
  });
});

router.post("/cta/:shiftNr/:role?/", async (req: Request, res: Response) => {
  if (!("token" in req.body)) return res.sendStatus(401);
  if (req.body.token !== process.env.API_OVERRIDE) return res.sendStatus(403);

  const shiftNr = parseInt(req.params.shiftNr);
  if (!shiftNr) return res.sendStatus(400);

  const result = await account.createSuToken(shiftNr);
  if (result) res.sendStatus(200);
  else res.sendStatus(400);
});

router.post(
  "/pwd/reset",
  validateBody(initiatePasswordResetRequestSchema),
  initiatePasswordReset,
);

router.post(
  "/password",
  validateBody(passwordResetRequestSchema),
  resetPassword,
);

// ---------- AUTH ZONE ------------------------------
router.use(jwt.verifyAccessToken);

// Permit new account creation, or delegate access to existing account.
router.post("/allocate/", async (req: Request, res: Response) => {
  const shiftNr = parseInt(req.body.shiftNr);
  const { email, role } = req.body;
  const statusCode = await generateAccessDelegationLink(
    email,
    shiftNr,
    role,
    req.user,
  );
  return res.sendStatus(statusCode);
});

router.post("/password/update", async (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) return res.sendStatus(400);
});

router.post("/email/update", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.sendStatus(400);

  const status = await account.updateEmail(req.user.id, email);
  if (status) return 200;
  else return 500;
});

router.post("/info", async (req: Request, res: Response) => {
  const userInfo = await user.getInfo(req.user.id);
  if (userInfo) return res.json(userInfo);
  res.sendStatus(403);
});

router.post("/shift/swap", async (req: Request, res: Response) => {
  let { shiftNr } = req.body;
  shiftNr = parseInt(shiftNr);
  if (!shiftNr) return res.sendStatus(400);

  const userIsBoss = req.user.role === "root";

  const result = await user.swapShift(req.user.id, shiftNr, userIsBoss);
  if (result) res.status(200).json({ role: result });
  else res.sendStatus(403);
});

router.post("/shift/validate", async (req: Request, res: Response) => {
  let { shiftNr } = req.body;
  shiftNr = parseInt(shiftNr);
  if (!shiftNr) return res.sendStatus(400);

  if (req.user.role === "boss") return res.status(200).json({ role: "boss" });

  const role = await user.validateShift(req.user.id, shiftNr);
  if (role) res.status(200).json({ role });
  else res.status(403).json({ role });
});

router.post("/shifts/get", async (req: Request, res: Response) => {
  const shifts = await user.getShifts();
  res.json(shifts);
});

export default router;
