import express, { Request, Response } from "express";
import path from "path";
import DummyGenerator from "../../utilities/dummyGenerator/dummyGenerator";

const router = express.Router();

router.get("/time/", (req: Request, res: Response) => {
  res.json({ time: Date.now(), isOk: true });
});

router.post("/namegen/", async (req: Request, res: Response) => {
  let { factor, authentic } = req.body;

  factor = parseInt(factor);
  if (isNaN(factor)) factor = 8;

  authentic = authentic === "true";

  await DummyGenerator.generate(authentic, factor);
  const filepath = path.resolve(
    path.join(__dirname, "../../../data/files", "regTest.jmx")
  );
  res.sendFile(filepath);
});

export default router;
