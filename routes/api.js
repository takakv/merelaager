const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();

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
    });
    const refreshToken = jwt.generateRefreshToken({
      username: req.body.username,
    });
    res.json({
      accessToken,
      refreshToken,
      user: { name: user.name, role: user.role },
    });
  } else {
    res.status(403).send("Incorrect username or password");
  }
});

router.use(jwt.verifyAccessToken);

const registrationList = require("../controllers/listController");

router.get("/reglist/fetch/", async (req, res) => {
  const data = await registrationList.fetch(req, res);
  if (data) res.json(data);
});

router.post("/reglist/update/:userId/:field/", async (req, res) => {
  const status = await registrationList.update(req, res);
  if (status) res.sendStatus(200);
});

module.exports = router;
