import path from "path";
import dotenv from "dotenv";

import express from "express";
import bodyParser from "body-parser";

import cors from "cors";
import api from "./routes/api";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://sild.merelaager.ee",
  "https://merelaager.ee",
  "http://localhost:8080",
];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  // https://stackoverflow.com/a/59812348
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api", api);

console.log(path.join(__dirname, "/routes/**/*.js"));

export const runApp = () => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`App listening on port ${port}`));
};
