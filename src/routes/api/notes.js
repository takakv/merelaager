const router = require("express").Router();
const shiftData = require("../../controllers/shiftController");
const { requireShiftBoss } = require("../Support Files/shiftAuth");

router.use(requireShiftBoss);

router.post("/update/:childId/", async (req, res) => {
  const childId = parseInt(req.params.childId);
  if (!childId) return res.sendStatus(400);
  if (typeof req.body.notes === "undefined") return res.sendStatus(400);

  if (await shiftData.updateNotes(childId, req.body.notes))
    return res.sendStatus(200);
  else res.sendStatus(404);
});

router.get("/fetch/:shiftNr/:camperId?/", async (req, res) => {
  const shiftNr = parseInt(req.params.shiftNr);
  const camperId = parseInt(req.params.camperId);
  if (!shiftNr) return res.sendStatus(400);

  let fileName;
  if (camperId) fileName = await shiftData.fetchCamperNote(shiftNr, camperId);
  else fileName = await shiftData.fetchAllNotes(shiftNr);

  if (fileName) return res.sendFile(fileName, { root: "./data/files" });
  res.sendStatus(404);
});

module.exports = router;
