const router = require("express").Router();
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const JWT = require("jsonwebtoken");
const jwt = require("./Support Files/jwt");
const userAuth = require("./Support Files/userAuth");

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

const account = require("./api/account");
router.use("/su", account);

const override = require("./api/override");
router.use("/or", override);

// ---------- AUTH ZONE ------------------------------
router.use(jwt.verifyAccessToken);

const registration = require("./api/registration");
router.use("/reglist", registration);

const campers = require("./api/campers");
router.use("/campers", campers);

const notes = require("./api/notes");
router.use("/notes", notes);

const tents = require("./api/tents");
router.use("/tents", tents);

const teams = require("./api/teams");
router.use("/teams", teams);

const staff = require("./api/staff");
router.use("/staff", staff);

const bill = require("../controllers/billController");
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

const shirtsData = require("../controllers/shirtController");
router.get("/shirts/fetch/", async (req, res) => {
  const data = await shirtsData.fetch();
  if (data) res.json(data);
  else res.sendStatus(500);
});

module.exports = router;
