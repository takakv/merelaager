const router = require("express").Router();

const shiftData = require("../../controllers/shiftController");

router.get("/fetch/:shiftNr/", async (req, res) => {
  if (!req.params["shiftNr"]) return res.sendStatus(400);
  const shiftNr = parseInt(req.params["shiftNr"]);
  const data = await shiftData.getTents(shiftNr);
  if (data) return res.json(data);
  res.sendStatus(404);
});

router.post("/update/presence/", async (req, res) => {
  const id = parseInt(req.body.id);
  if (!id) return res.sendStatus(400);
  const result = await shiftData.updatePresence(id);
  if (result) return res.sendStatus(200);
  else return res.sendStatus(404);
});

router.post("/update/:entryId/:tentNr/", async (req, res) => {
  if (!req.params.entryId || !req.params.tentNr) return res.sendStatus(400);

  const entryId = parseInt(req.params.entryId);
  const tentNr = parseInt(req.params.tentNr);

  if (await shiftData.updateTent(entryId, tentNr)) return res.sendStatus(200);
  return res.sendStatus(404);
});

module.exports = router;
