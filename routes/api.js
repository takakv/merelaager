const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();

const JWT = require("jsonwebtoken");
const jwt = require("./Support Files/jwt");
const userAuth = require("./Support Files/userAuth");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post("/login/", async (req, res) => {
  if (
    typeof req.body.username === "undefined" ||
    typeof req.body.password === "undefined"
  )
    return res.sendStatus(401);

  const { username, password } = req.body;

  const credentials = await userAuth.authenticateUser(username, password);
  if (!credentials) return res.status(403).send("Incorrect credentials.");
  res.json(credentials);
});

router.post("/token/", async (req, res) => {
  const { token } = req.body;

  if (!token) return res.sendStatus(401);
  if (!(await userAuth.matchToken(token))) return res.sendStatus(403);

  JWT.verify(token, jwt.refreshTokenSecret, (err, user) => {
    if (err) {
      console.warn("A STORED TOKEN DOES NOT APPEAR TO BE VALID!");
      return res.sendStatus(403);
    }
    const accessToken = jwt.generateAccessToken({
      username: user.username,
      role: user.role,
    });
    res.json({ accessToken });
  });
});

const account = require("../controllers/accountController");

router.get("/su/:token/", async (req, res) => {
  const response = await account.validateSuToken(req.params.token);
  if (response) res.sendStatus(200);
  else res.sendStatus(401);
});

router.post("/su/create/", async (req, res) => {
  const { username, password, token, name } = req.body;
  if (!username || !password || !token) return res.sendStatus(400);
  const result = await account.create(username, password, token, name);
  if (result)
    return res
      .status(200)
      .send("Konto loodud. Sisse saab logida: https://sild.merelaager.ee");
  else res.sendStatus(400);
});

router.post("/su/ct/:shiftNr/:role?/", async (req, res) => {
  if (!("token" in req.body)) return res.sendStatus(401);
  if (req.body.token !== process.env.API_OVERRIDE) return res.sendStatus(403);

  const shiftNr = parseInt(req.params.shiftNr);
  if (!shiftNr) return res.sendStatus(400);

  const result = await account.createSuToken(shiftNr);
  if (result) res.sendStatus(200);
  else res.sendStatus(400);
});

const registrationList = require("../controllers/listController");
const bill = require("../controllers/billController");
const shiftData = require("../controllers/shiftController");
const shirtsData = require("../controllers/shirtController");
const childData = require("../controllers/childController");
const newShiftData = require("../controllers/newShiftController");
const team = require("../controllers/teamController");

router.post("/newchildren/", async (req, res) => {
  if (!("token" in req.body)) return res.sendStatus(401);
  if (req.body.token !== process.env.API_OVERRIDE) return res.sendStatus(403);
  try {
    await childData.newChildren();
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/children/", async (req, res) => {
  if (!("token" in req.body)) return res.sendStatus(401);
  if (req.body.token !== process.env.API_OVERRIDE) return res.sendStatus(403);
  try {
    await childData.forceUpdate();
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/shift/", async (req, res) => {
  if (!("token" in req.body)) return res.sendStatus(401);
  if (req.body.token !== process.env.API_OVERRIDE) return res.sendStatus(403);
  try {
    await newShiftData.forceUpdate();
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// INTERNAL DATA.
// router.use(jwt.verifyAccessToken);

// Fetch the whole list of children and their registration status.
router.get("/reglist/fetch/", async (req, res) => {
  try {
    const data = await registrationList.fetch(req, res);
    if (data) res.json(data);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.get("/reglist/print/:shiftNr/", async (req, res) => {
  if (!req.params["shiftNr"]) return res.sendStatus(400);
  const shiftNr = parseInt(req.params["shiftNr"]);
  const filename = await registrationList.print(shiftNr);
  if (filename) return res.sendFile(filename, { root: "./data/files" });
  res.sendStatus(404);
});

router.post("/reglist/update/:userId/:field/:value?/", async (req, res) => {
  try {
    const status = await registrationList.update(req, res);
    if (status) res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/reglist/remove/:userId/", async (req, res) => {
  try {
    const status = await registrationList.remove(req, res);
    if (status) res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

router.post("/bills/:action/:email", async (req, res) => {
  if (!req.params["action"] || !req.params["email"]) {
    return res.sendStatus(400);
  }
  switch (req.params["action"]) {
    case "fetch":
      await bill.fetch(req, res);
      break;
    case "create":
      await bill.create(req, res);
      break;
    default:
      return res.sendStatus(404);
  }
});

router.get("/tents/fetch/:shiftNr/", async (req, res) => {
  if (!req.params["shiftNr"]) return res.sendStatus(400);
  const shiftNr = parseInt(req.params["shiftNr"]);
  const data = await shiftData.getTents(shiftNr);
  if (data) return res.json(data);
  res.sendStatus(404);
});

router.post("/tents/update/:entryId/:tentNr/", async (req, res) => {
  if (!req.params.entryId || !req.params.tentNr) return res.sendStatus(400);

  const entryId = parseInt(req.params.entryId);
  const tentNr = parseInt(req.params.tentNr);

  if (await shiftData.updateTent(entryId, tentNr)) return res.sendStatus(200);
  return res.sendStatus(404);
});

router.post("/notes/update/:childId/", async (req, res) => {
  const childId = parseInt(req.params.childId);
  if (!childId) return res.sendStatus(400);
  if (typeof req.body.notes === "undefined") return res.sendStatus(400);

  if (await shiftData.updateNotes(childId, req.body.notes))
    return res.sendStatus(200);
  else res.sendStatus(404);
});

router.get("/notes/fetch/:shiftNr/:camperId?/", async (req, res) => {
  const shiftNr = parseInt(req.params.shiftNr);
  const camperId = parseInt(req.params.camperId);
  if (!shiftNr) return res.sendStatus(400);

  let fileName;
  if (camperId) fileName = await shiftData.fetchCamperNote(shiftNr, camperId);
  else fileName = await shiftData.fetchAllNotes(shiftNr);

  if (fileName) return res.sendFile(fileName, { root: "./data/files" });
  res.sendStatus(404);
});

router.get("/shirts/fetch/", async (req, res) => {
  const data = await shirtsData.fetch();
  if (data) res.json(data);
  else res.sendStatus(500);
});

router.get("/campers/info/fetch/:shiftNr?/", async (req, res) => {
  const shiftNr = parseInt(req.params.shiftNr);
  if (Number.isNaN(shiftNr)) return res.sendStatus(400);

  const data = await newShiftData.getInfo(shiftNr);
  if (data) res.json(data);
  else res.sendStatus(500);
});

// Teams

router.get("/teams/fetch/:shiftNr/", async (req, res) => {
  const shiftNr = parseInt(req.params.shiftNr);
  if (Number.isNaN(shiftNr)) return res.sendStatus(400);

  const teams = await team.fetchForShift(shiftNr);
  return teams ? res.json(teams) : res.sendStatus(500);
});

router.post("/teams/create/", async (req, res) => {
  const shiftNr = parseInt(req.body.shiftNr);
  const teamName = req.body.name;

  if (!shiftNr || !teamName) return res.sendStatus(400);
  return (await team.createTeam(teamName, shiftNr))
    ? res.sendStatus(200)
    : res.sendStatus(500);
});

router.post("/teams/member/add/", async (req, res) => {
  const teamId = parseInt(req.body.teamId);
  const dataId = parseInt(req.body.dataId);

  if (!teamId || !dataId) return res.sendStatus(400);
  return (await team.addMember(teamId, dataId))
    ? res.sendStatus(200)
    : res.sendStatus(500);
});

router.post("/teams/member/remove/", async (req, res) => {
  const dataId = parseInt(req.body.dataId);

  if (!dataId) return res.sendStatus(400);
  return (await team.removeMember(dataId))
    ? res.sendStatus(200)
    : res.sendStatus(500);
});

router.post("/teams/set/place/", async (req, res) => {
  const teamId = parseInt(req.body.teamId);
  const place = parseInt(req.body.place);

  if (!teamId || !place) return res.sendStatus(400);
  return (await team.setPlace(teamId, place))
    ? res.sendStatus(200)
    : res.sendStatus(500);
});

module.exports = router;
