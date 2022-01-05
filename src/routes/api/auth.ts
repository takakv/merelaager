import express, { Request, Response } from "express";
import {InvalidTokenError, MissingTokenError} from "../Support Files/Errors/jwtAuth";

const router = express.Router();

const JWT = require("jsonwebtoken");

const userAuth = require("../Support Files/userAuth");
const jwt = require("../Support Files/jwt");

router.post("/login/", async (req: Request, res: Response) => {
  if (
    typeof req.body.username === "undefined" ||
    typeof req.body.password === "undefined"
  )
    return res.sendStatus(401);

  const { username, password } = req.body;

  const credentials = await userAuth.authenticateUser(username, password);
  if (!credentials) return res.status(403).send("Incorrect credentials.");
  res.json(credentials);
});

router.post("/token/", async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).json(new MissingTokenError().getJson());
  if (!(await userAuth.matchToken(token))) return res.status(401).json(new InvalidTokenError().getJson());

  JWT.verify(token, jwt.refreshTokenSecret, (err, user) => {
    if (err) {
      console.warn("A STORED TOKEN DOES NOT APPEAR TO BE VALID!");
      return res.sendStatus(403);
    }
    const accessToken = jwt.generateAccessToken({
      username: user.username,
      role: user.role,
    }).accessToken;
    res.json({ accessToken });
  });
});

export default router;
