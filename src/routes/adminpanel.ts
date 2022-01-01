require("dotenv").config();
import express from "express";

const router = express.Router();

router.get("/*", (...[, res]) => {
  res.redirect(process.env.ADMIN_SITE);
});

module.exports = router;
