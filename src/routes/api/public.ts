import express from "express";
import path from "path";

const router = express.Router();

router.get("/time/", async (req, res) => {
  res.json({ time: Date.now(), isOk: true });
});

const dummyGenerator = require("../../utilities/dummyGenerator/dummyGenerator");

router.post("/namegen/", async (req, res) => {
  let { factor, authentic } = req.body;

  factor = parseInt(factor);
  if (isNaN(factor)) factor = 8;

  authentic = authentic === "true";

  await dummyGenerator.generate(authentic, factor);
  const filepath = path.resolve(
    path.join(__dirname, "../../data/files", "regTest.jmx")
  );
  res.sendFile(filepath);
});

export default router;
