const router = require("express").Router();
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const auth = require("./api/auth");
router.use("/auth", auth);

const account = require("./api/account");
router.use("/su", account);

const override = require("./api/override");
router.use("/or", override);

const pub = require("./api/public");
router.use("/pb", pub);

// ---------- AUTH ZONE ------------------------------
const jwt = require("./Support Files/jwt");
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

// Disable since unneeded
// const users = require("./api/users");
// router.use("/users", users);

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
  res.json(data);
});

module.exports = router;
