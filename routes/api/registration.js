const router = require("express").Router();
const registrationList = require("../../controllers/listController");
const { requireShiftBoss } = require("../Support Files/shiftAuth");

// Fetch the whole list of children and their registration status.
router.get("/fetch/", async (req, res) => {
  try {
    const data = await registrationList.fetch(req, res);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.use(requireShiftBoss);

router.get("/print/:shiftNr/", async (req, res) => {
  if (!req.params["shiftNr"]) return res.sendStatus(400);
  const shiftNr = parseInt(req.params["shiftNr"]);
  const filename = await registrationList.print(shiftNr);
  if (filename) return res.sendFile(filename, { root: "./data/files" });
  res.sendStatus(404);
});

router.post("/update/:userId/:field/:value?/", async (req, res) => {
  try {
    const status = await registrationList.update(req, res);
    if (status) res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/remove/:userId/", async (req, res) => {
  try {
    const status = await registrationList.remove(req, res);
    if (status) res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

module.exports = router;