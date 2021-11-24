const router = require("express").Router();

const account = require("../../controllers/accountController");
const jwt = require("../Support Files/jwt");

router.get("/:token/", async (req, res) => {
  const response = await account.validateSuToken(req.params.token);
  if (!response) return res.sendStatus(401);
  else
    res.render("accountReg", {
      title: "Loo kasutaja",
      layout: "empty",
      script_path: "/media/scripts/signup.js",
    });
});

router.post("/chkusr/", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.sendStatus(400);
  if (await account.checkUser(username)) res.sendStatus(200);
  else res.sendStatus(404);
});

router.post("/create/", async (req, res) => {
  const { username, password, token, name } = req.body;
  if (!username || !password || !token) return res.sendStatus(400);
  const result = await account.create(username, password, token, name);
  if (!result)
    return res
      .status(200)
      .send("Konto loodud. Sisse saab logida: https://sild.merelaager.ee");
  else res.json(result);
});

router.post("/cta/:shiftNr/:role?/", async (req, res) => {
  if (!("token" in req.body)) return res.sendStatus(401);
  if (req.body.token !== process.env.API_OVERRIDE) return res.sendStatus(403);

  const shiftNr = parseInt(req.params.shiftNr);
  if (!shiftNr) return res.sendStatus(400);

  const result = await account.createSuToken(shiftNr);
  if (result) res.sendStatus(200);
  else res.sendStatus(400);
});

// ---------- AUTH ZONE ------------------------------
router.use(jwt.verifyAccessToken);

router.post("/ct/", async (req, res) => {
  const shiftNr = parseInt(req.body.shiftNr);
  const { email } = req.body;
  if (!shiftNr || !email) return res.sendStatus(400);

  const result = await account.createSuToken(shiftNr);
  if (!result) res.sendStatus(400);

  const mailStatus = await account.sendEmail(email, result);
  if (mailStatus) res.sendStatus(200);
  else {
    await account.destroyToken(result);
    res.sendStatus(400);
  }
});

router.post("/email/update", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.sendStatus(400);

  const status = await account.updateEmail(req.user.id, email);
  if (status) return 200;
  else return 500;
});

module.exports = router;
