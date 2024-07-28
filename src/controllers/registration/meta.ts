export const unlockTime = new Date(Date.parse("01 Jan 2024 11:59:59 UTC"));
const now = Date.now();
export const eta = unlockTime.getTime() - now;

export const registrationPrices = {
  1: 320,
  2: 340,
  3: 340,
  4: 340,
};

export const registrationPriceDiff = 20;
