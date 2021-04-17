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

const registrationList = require("../controllers/listController");
const bill = require("../controllers/billController");
const shiftData = require("../controllers/shiftController");
const shirtsData = require("../controllers/shirtController");

// FORCED DB UPDATES.
router.post("/ucl/", async (req, res) => {
  if (!("token" in req.body)) return res.sendStatus(401);
  if (req.body.token !== process.env.API_OVERRIDE) return res.sendStatus(403);
  try {
    await shiftData.forceUpdate();
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

// INTERNAL DATA.
router.use(jwt.verifyAccessToken);

router.get("/reglist/fetch/", async (req, res) => {
  try {
    const data = await registrationList.fetch(req, res);
    if (data) res.json(data);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
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

router.post("/tents/update/:childId/:tentId/", async (req, res) => {
  if (!req.params["childId"] || !req.params["tentId"])
    return res.sendStatus(400);
  const [childId, tentNr] = [
    parseInt(req.params["childId"]),
    parseInt(req.params["tentId"]),
  ];
  if (await shiftData.updateTent(tentNr, childId)) return res.sendStatus(200);
  res.sendStatus(404);
});

router.get("/shirts/fetch/", async (req, res) => {
  const data = await shirtsData.fetch();
  if (data) res.json(data);
  else res.sendStatus(500);
});

module.exports = router;
