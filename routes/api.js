const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();

const JWT = require("jsonwebtoken");
const jwt = require("./Support Files/jwt");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const refreshTokens = [];

router.post("/login/", async (req, res) => {
  if (
    typeof req.body.username === "undefined" ||
    typeof req.body.password === "undefined"
  ) {
    res.sendStatus(401);
    return;
  }
  const { username, password } = req.body;
  const user = await jwt.fetchUser(username, password);

  if (user) {
    const accessToken = jwt.generateAccessToken({
      username: req.body.username,
      role: user.role,
    });
    const refreshToken = jwt.generateRefreshToken({
      username: req.body.username,
      role: user.role,
    });
    refreshTokens.push(refreshToken);
    res.json({
      accessToken,
      refreshToken,
      user: { name: user.name, role: user.role },
    });
  } else {
    res.status(403).send("Incorrect username or password");
  }
});

router.post("/token/", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }

  JWT.verify(token, jwt.refreshTokenSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    const accessToken = jwt.generateAccessToken({
      username: user.username,
      role: user.role,
    });
    res.json({ accessToken });
  });
});

router.use(jwt.verifyAccessToken);

const registrationList = require("../controllers/listController");
const bill = require("../controllers/billController");

router.get("/reglist/fetch/", async (req, res) => {
  const data = await registrationList.fetch(req, res);
  if (data) res.json(data);
});

router.post("/reglist/update/:userId/:field/:value/", async (req, res) => {
  const status = await registrationList.update(req, res);
  if (status) res.sendStatus(200);
});

router.post("/bills/:action/:email", async (req, res) => {
  if (!req.params["action"] || !req.params["email"]) {
    res.sendStatus(400);
    return;
  }
  switch (req.params["action"]) {
    case "fetch":
      await bill.fetch(req, res);
      break;
    case "create":
      await bill.create(req, res);
      break;
    default:
      res.sendStatus(404);
      break;
  }
});

module.exports = router;
