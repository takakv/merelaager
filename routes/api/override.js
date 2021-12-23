const router = require("express").Router();

const childData = require("../../controllers/childController");
const newShiftData = require("../../controllers/newShiftController");
const records = require("../../controllers/recordController");

router.use((req, res, next) => {
  if (!("token" in req.body)) return res.sendStatus(401);
  if (req.body.token !== process.env.API_OVERRIDE) return res.sendStatus(403);
  next();
});

router.post("/newchildren/", async (req, res) => {
  try {
    await childData.newChildren();
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/children/", async (req, res) => {
  try {
    await childData.forceUpdate();
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/shift/", async (req, res) => {
  try {
    await newShiftData.forceUpdate();
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/reg/fk/update/", async (req, res) => {
  try {
    await childData.linkReg();
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/records/", async (req, res) => {
  try {
    const tmp = await records.updateCurrentYear();
    if (tmp) res.sendStatus(201);
    else res.sendStatus(500);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

module.exports = router;
