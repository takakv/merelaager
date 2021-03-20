require("dotenv").config();
const express = require("express");
const router = express.Router();

router.get("/*", (...[, res]) => {
  res.redirect(process.env.ADMIN_SITE);
});

module.exports = router;
