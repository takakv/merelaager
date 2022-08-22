import pino from "pino";

export const logger = pino(
  {
    base: undefined,
  },
  pino.destination(`./logs/combined.log`)
);
