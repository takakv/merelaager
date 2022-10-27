const unlockTime = new Date(Date.parse("01 Jan 2022 11:59:50 UTC"));
const now = Date.now();
const eta = unlockTime.getTime() - now;

const prices = {
  1: 240,
  2: 320,
  3: 200,
  4: 320,
  5: 320,
};

const priceDiff = 20;

const openSlots = {
  1: { M: 20, F: 20 },
  2: { M: 20, F: 20 },
  3: { M: 24, F: 16 },
  4: { M: 20, F: 20 },
  5: { M: 20, F: 20 },
};

module.exports = {
  unlockTime,
  now,
  eta,
  prices,
  priceDiff,
  openSlots,
};
