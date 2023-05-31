import express from "express";
import { logInUser, refreshToken } from "../controllers/auth.controller";
import cookieParser from "cookie-parser";

const router = express.Router();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/login", logInUser);

router.use(cookieParser());

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/token", refreshToken);

export default router;
