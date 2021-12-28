const router = require("express").Router();

router.get("/time/", async (req, res) => {
  res.json({ time: Date.now(), isOk: true });
});

const dummyGenerator = require("../../utilities/dummyGenerator/dummyGenerator");

router.post("/namegen/", async (req, res) => {
  dummyGenerator.generate();
  res.sendStatus(200);
});

module.exports = router;
