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
  1: { M: 0, F: 0 },
  2: { M: 0, F: 0 },
  3: { M: 0, F: 0 },
  4: { M: 0, F: 0 },
  5: { M: 0, F: 0 },
};

module.exports = {
  unlockTime,
  now,
  eta,
  prices,
  openSlots,
};
