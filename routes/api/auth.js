const router = require("express").Router();
const JWT = require("jsonwebtoken");

const userAuth = require("../Support Files/userAuth");
const jwt = require("../Support Files/jwt");

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
    }).accessToken;
    res.json({ accessToken });
  });
});

module.exports = router;