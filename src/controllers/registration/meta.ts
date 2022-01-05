const unlockTime = new Date(Date.parse("01 Jan 2022 11:59:50 UTC"));
const now = Date.now();
const eta = unlockTime.getTime() - now;

export const prices = {
  1: 240,
  2: 320,
  3: 200,
  4: 320,
  5: 320,
};

const openSlots = {
  1: { M: 19, F: 17 },
  2: { M: 13, F: 17 },
  3: { M: 18, F: 18 },
  4: { M: 9, F: 16 },
  5: { M: 14, F: 18 },
};

module.exports = {
  unlockTime,
  now,
  eta,
  prices,
  openSlots,
};
