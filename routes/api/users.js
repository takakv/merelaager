const router = require("express").Router();
const user = require("../../controllers/userController");

router.get("/", async (req, res) => {
  if (!req.user.isRoot) return res.sendStatus(403);

  const data = await user.fetchAll();
  if (!data.isOk) return res.sendStatus(data.code);
  return res.json(data.users);
});

module.exports = router;
