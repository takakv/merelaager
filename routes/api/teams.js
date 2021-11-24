const router = require("express").Router();

const team = require("../../controllers/teamController");

router.get("/fetch/:shiftNr/", async (req, res) => {
  const shiftNr = parseInt(req.params.shiftNr);
  if (Number.isNaN(shiftNr)) return res.sendStatus(400);

  const teams = await team.fetchForShift(shiftNr);
  return teams ? res.json(teams) : res.sendStatus(500);
});

router.post("/create/", async (req, res) => {
  const shiftNr = parseInt(req.body.shiftNr);
  const teamName = req.body.name;

  if (!shiftNr || !teamName) return res.sendStatus(400);
  return (await team.createTeam(teamName, shiftNr))
    ? res.sendStatus(200)
    : res.sendStatus(500);
});

router.post("/member/add/", async (req, res) => {
  const teamId = parseInt(req.body.teamId);
  const dataId = parseInt(req.body.dataId);

  if (!teamId || !dataId) return res.sendStatus(400);
  return (await team.addMember(teamId, dataId))
    ? res.sendStatus(200)
    : res.sendStatus(500);
});

router.post("/member/remove/", async (req, res) => {
  const dataId = parseInt(req.body.dataId);

  if (!dataId) return res.sendStatus(400);
  return (await team.removeMember(dataId))
    ? res.sendStatus(200)
    : res.sendStatus(500);
});

router.post("/set/place/", async (req, res) => {
  const teamId = parseInt(req.body.teamId);
  const place = parseInt(req.body.place);

  if (!teamId || !place) return res.sendStatus(400);
  return (await team.setPlace(teamId, place))
    ? res.sendStatus(200)
    : res.sendStatus(500);
});

module.exports = router;
