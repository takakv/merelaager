const router = require("express").Router();

router.get("/time/", async (req, res) => {
  res.json({ time: Date.now(), isOk: true });
});

module.exports = router;
