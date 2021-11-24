const router = require("express").Router();

const staff = require("../../controllers/staffController");

router.post("/create/", async (req, res) => {
  const shiftNr = parseInt(req.body.shiftNr);
  const { name, role } = req.body;
  if (!shiftNr || !name || !role) return res.sendStatus(400);

  const result = await staff.create(shiftNr, name, role);
  if (result) res.sendStatus(201);
  else res.sendStatus(500);
});

router.get("/:shiftNr/", async (req, res) => {
  const shiftNr = parseInt(req.params.shiftNr);
  if (!shiftNr) return res.sendStatus(400);

  const result = await staff.fetch(shiftNr);
  if (!result) return res.sendStatus(404);
  res.json(result);
});

module.exports = router;
