const router = require("express").Router();

router.get("/time/", async (req, res) => {
  res.json({ time: Date.now(), isOk: true });
});

const utility = require("../../controllers/utilityController");

router.post("/namegen/", async (req, res) => {
  utility.generateData();
  res.sendStatus(200);
});

module.exports = router;
